import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { products, orders, orderItems } from "@db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import express from "express";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY must be set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and WebP are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export function registerRoutes(app: Express): Server {
  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));
  app.use("/attached_assets", express.static("attached_assets"));

  // Products routes
  app.get("/api/products", async (req, res, next) => {
    try {
      const allProducts = await db.query.products.findMany();
      res.json(allProducts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/products", upload.single("image"), async (req, res, next) => {
    try {
      const { name, description, price, inventory } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      if (!imageUrl) {
        return res.status(400).json({ error: "Image is required" });
      }

      const [product] = await db
        .insert(products)
        .values({
          name,
          description,
          price: price.toString(),
          inventory: parseInt(inventory),
          image: imageUrl,
        })
        .returning();

      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  // Create order with fixed price
  app.post("/api/orders", async (req, res) => {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Invalid items array" });
      }

      const quantity = items[0].quantity;
      const unitPrice = 1999; // $19.99 in cents
      const totalAmount = unitPrice * quantity;

      // Create pending order
      const [order] = await db
        .insert(orders)
        .values({
          status: "pending",
          total: (totalAmount / 100).toString(), // Convert cents to dollars
        })
        .returning();

      // Create order items
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: 1, // RestEaze product ID
        quantity: quantity,
        price: "19.99", // Fixed price in dollars
      });

      // Get the base URL for the application
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      // Create Stripe checkout session with fixed price
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'resteez RLS relief band',
              description: 'Relief band for Restless Legs Syndrome',
            },
            unit_amount: unitPrice,
          },
          quantity: quantity,
        }],
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancel_url: `${baseUrl}/cart`,
        shipping_address_collection: {
          allowed_countries: ["US"],
        },
        metadata: {
          orderId: order.id.toString(),
        },
      });

      res.json({ url: session.url });
    } catch (error) {
      res.status(500).json({
        error: "Failed to create checkout session"
      });
    }
  });

  // Register error handling middleware last
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}

const errorHandler = (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  console.error("Error occurred:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};