import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { products, orders, orderItems } from "@db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import EasyPost from "@easypost/api";
import multer from "multer";
import path from "path";
import express from "express";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const easypost = new EasyPost(process.env.EASYPOST_API_KEY || '');

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

export function registerRoutes(app: Express): Server {
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Products routes
  app.get("/api/products", async (req, res) => {
    const allProducts = await db.query.products.findMany();
    res.json(allProducts);
  });

  app.post("/api/products", upload.single('image'), async (req, res) => {
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
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  // Cart and checkout routes
  app.post("/api/orders", async (req, res) => {
    const { items, customerEmail, shippingAddress } = req.body;

    // Calculate total
    const total = items.reduce((acc: number, item: any) => 
      acc + (item.price * item.quantity), 0);

    // Create order
    const [order] = await db.insert(orders).values({
      customerEmail,
      shippingAddress,
      total,
      status: 'pending'
    }).returning();

    // Create order items
    await Promise.all(items.map((item: any) =>
      db.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })
    ));

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      metadata: { orderId: order.id }
    });

    res.json({
      orderId: order.id,
      clientSecret: paymentIntent.client_secret
    });
  });

  // Order fulfillment routes
  app.post("/api/orders/:orderId/fulfill", async (req, res) => {
    const { orderId } = req.params;
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, parseInt(orderId))
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    try {
      // Create shipping label
      const shipment = await easypost.Shipment.create({
        to_address: order.shippingAddress,
        from_address: {
          company: 'Medical Devices Co',
          street1: '123 Shipper St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94111',
          country: 'US'
        },
        parcel: {
          length: 9,
          width: 6,
          height: 2,
          weight: 10
        }
      });

      const label = await shipment.buy(shipment.lowest_rate());

      // Update order with shipping info
      await db.update(orders)
        .set({
          status: 'fulfilled',
          shippingLabelUrl: label.postage_label.label_url,
          trackingNumber: label.tracking_code
        })
        .where(eq(orders.id, parseInt(orderId)));

      res.json({ success: true });
    } catch (error) {
      console.error('Error fulfilling order:', error);
      res.status(500).json({ error: 'Failed to fulfill order' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}