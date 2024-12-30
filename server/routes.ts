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

// Error handling middleware
const errorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    detail: err.detail
  });

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      error: 'Invalid reference: ' + (err.detail || 'Referenced record does not exist')
    });
  }

  if (err.code === 'P2002') { // Unique constraint violation
    return res.status(400).json({
      error: 'Record already exists'
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

export function registerRoutes(app: Express): Server {
  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Serve attached assets
  app.use('/attached_assets', express.static('attached_assets'));

  // Products routes
  app.get("/api/products", async (req, res, next) => {
    try {
      console.log('Fetching products...');
      const allProducts = await db.query.products.findMany();
      console.log('Products fetched:', allProducts);
      res.json(allProducts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/products", upload.single('image'), async (req, res, next) => {
    try {
      console.log('Creating product with data:', req.body);
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

      console.log('Product created:', product);
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  // Cart and checkout routes
  app.post("/api/orders", async (req, res, next) => {
    try {
      console.log('Creating order with data:', req.body);
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

      console.log('Order created:', order);

      // Create order items
      const orderItemsPromises = items.map(async (item: any) => {
        return db.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
      });

      await Promise.all(orderItemsPromises);

      res.json({
        orderId: order.id,
      });
    } catch (error) {
      next(error);
    }
  });

  // Finalize order
  app.post("/api/orders/:orderId/finalize", async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const { customerEmail, shippingAddress } = req.body;

      const order = await db.query.orders.findFirst({
        where: eq(orders.id, parseInt(orderId))
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Update order with customer info
      await db.update(orders)
        .set({
          customerEmail,
          shippingAddress,
          status: 'confirmed'
        })
        .where(eq(orders.id, parseInt(orderId)));

      // Create shipping label
      const shipment = await easypost.Shipment.create({
        to_address: shippingAddress,
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

      // Buy the lowest rate
      const rate = await shipment.lowestRate();
      const label = await shipment.buy(rate);

      // Update order with shipping info
      await db.update(orders)
        .set({
          status: 'fulfilled',
          shippingLabelUrl: label.postageLabel.labelUrl,
          trackingNumber: label.trackingCode
        })
        .where(eq(orders.id, parseInt(orderId)));

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Register error handling middleware last
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}