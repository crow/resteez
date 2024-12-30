import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { products, orders, orderItems } from "@db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import express from "express";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Error handling middleware
const errorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error occurred:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

export function registerRoutes(app: Express): Server {
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));
  app.use('/attached_assets', express.static('attached_assets'));

  // Add a test endpoint to get the hosted URL
  app.get("/api/get-hosted-url", (req, res) => {
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const webhookUrl = `${baseUrl}/api/webhooks/stripe`;
    console.log('Request headers:', req.headers);
    console.log('Generated URLs:', { baseUrl, webhookUrl });
    res.json({
      baseUrl,
      webhookUrl
    });
  });

  // Products routes
  app.get("/api/products", async (req, res, next) => {
    try {
      const allProducts = await db.query.products.findMany();
      res.json(allProducts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/products", upload.single('image'), async (req, res, next) => {
    try {
      const { name, description, price, inventory } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      if (!imageUrl) {
        return res.status(400).json({ error: 'Image is required' });
      }

      const [product] = await db.insert(products).values({
        name,
        description,
        price: parseFloat(price),
        inventory: parseInt(inventory),
        image: imageUrl
      }).returning();

      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  // Create order and initiate Stripe checkout
  app.post("/api/orders", async (req, res, next) => {
    try {
      const { items } = req.body;

      // Calculate total
      const total = items.reduce((acc: number, item: any) =>
        acc + (item.price * item.quantity), 0);

      // Create pending order
      const [order] = await db.insert(orders).values({
        status: 'pending',
        total,
      }).returning();

      // Create order items
      await Promise.all(items.map((item: any) =>
        db.insert(orderItems).values({
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })
      ));

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              // Use absolute URLs for images
              images: [new URL(item.image, `${req.protocol}://${req.get('host')}`).toString()],
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancel_url: `${req.protocol}://${req.get('host')}/cart`,
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
        metadata: {
          orderId: order.id.toString()
        }
      });

      res.json({
        sessionId: session.id,
        orderId: order.id
      });
    } catch (error) {
      next(error);
    }
  });

  // Check session status and update order
  app.get("/api/orders/:orderId/check-payment", async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const { sessionId } = req.query;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId as string);

      if (session.payment_status === 'paid') {
        // Update order status and add shipping details
        await db.update(orders)
          .set({
            status: 'confirmed',
            customerEmail: session.customer_details?.email,
            shippingAddress: session.shipping_details
          })
          .where(eq(orders.id, parseInt(orderId)));

        return res.json({ status: 'confirmed' });
      }

      res.json({ status: session.payment_status });
    } catch (error) {
      next(error);
    }
  });

  // Webhook handler for Stripe events
  app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig || '',
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed');
      return res.status(400).send('Webhook signature verification failed');
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      try {
        // Update order status and add shipping details
        const orderId = session.metadata?.orderId;
        if (!orderId) {
          throw new Error('No order ID in metadata');
        }

        await db.update(orders)
          .set({
            status: 'confirmed',
            customerEmail: session.customer_details?.email,
            shippingAddress: session.shipping_details
          })
          .where(eq(orders.id, parseInt(orderId)));

        console.log(`Order ${orderId} confirmed via webhook`);
      } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).send('Error processing webhook');
      }
    }

    res.json({ received: true });
  });

  // Register error handling middleware last
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}