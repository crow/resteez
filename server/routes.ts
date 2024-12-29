import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { products, orders, orderItems } from "@db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import EasyPost from "@easypost/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const easypost = new EasyPost(process.env.EASYPOST_API_KEY || '');

export function registerRoutes(app: Express): Server {
  // Products routes
  app.get("/api/products", async (req, res) => {
    const allProducts = await db.query.products.findMany();
    res.json(allProducts);
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

    const label = await shipment.buy(shipment.lowestRate());

    // Update order with shipping info
    await db.update(orders)
      .set({
        status: 'fulfilled',
        shippingLabelUrl: label.postage_label.label_url,
        trackingNumber: label.tracking_code
      })
      .where(eq(orders.id, parseInt(orderId)));

    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
