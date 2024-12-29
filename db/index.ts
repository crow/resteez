import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enhanced error handling for database connection
const dbConnection = {
  connection: process.env.DATABASE_URL,
  schema,
  ws: ws,
  connectionOptions: {
    max_retries: 5,
    retry_interval: 1000,
  }
};

export const db = drizzle(dbConnection);

// Add connection status check
export const checkConnection = async () => {
  try {
    // Simple query to test connection
    await db.execute(sql`SELECT 1`);
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};