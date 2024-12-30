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
              images: [item.image],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'FI', 'JP'],
        },
        metadata: {
          orderId: order.id.toString()
        },
        success_url: `${req.protocol}://${req.get('host')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/cart`,
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

  // Register error handling middleware last
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}