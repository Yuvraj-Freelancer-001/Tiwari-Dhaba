import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";

// The database schema is normally created by running `drizzle-kit push`
// manually. On a fresh Railway Postgres instance that step is easy to miss,
// which makes every API route depending on these tables fail. Creating the
// tables here (if they don't already exist) makes the app self-healing on
// boot, so a forgotten manual migration step can't take the whole API down.
let schemaReadyPromise: Promise<void> | undefined;

export async function ensureSchema(): Promise<void> {
  if (!schemaReadyPromise) {
    schemaReadyPromise = pool
      .query(`
        CREATE TABLE IF NOT EXISTS dhaba_menu_items (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          category TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          price REAL NOT NULL DEFAULT 100,
          price_is_placeholder BOOLEAN NOT NULL DEFAULT TRUE,
          available BOOLEAN NOT NULL DEFAULT TRUE,
          image_path TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS dhaba_room_types (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL DEFAULT '',
          price_per_night REAL NOT NULL DEFAULT 1000,
          price_is_placeholder BOOLEAN NOT NULL DEFAULT TRUE,
          image_path TEXT,
          blocked_dates JSONB NOT NULL DEFAULT '[]'::jsonb
        );

        CREATE TABLE IF NOT EXISTS dhaba_gallery_images (
          id SERIAL PRIMARY KEY,
          section TEXT NOT NULL,
          caption TEXT NOT NULL,
          image_path TEXT,
          is_placeholder BOOLEAN NOT NULL DEFAULT TRUE
        );

        CREATE TABLE IF NOT EXISTS dhaba_orders (
          id SERIAL PRIMARY KEY,
          reference TEXT NOT NULL UNIQUE,
          customer_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          fulfillment TEXT NOT NULL,
          payment_method TEXT NOT NULL,
          items JSONB NOT NULL,
          total REAL NOT NULL,
          payment_status TEXT NOT NULL DEFAULT 'pending',
          payment_id TEXT,
          razorpay_order_id TEXT,
          status TEXT NOT NULL DEFAULT 'Received',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS dhaba_bookings (
          id SERIAL PRIMARY KEY,
          reference TEXT NOT NULL UNIQUE,
          customer_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          check_in DATE NOT NULL,
          check_out DATE NOT NULL,
          guests INTEGER NOT NULL,
          room_type_id INTEGER NOT NULL,
          room_type_name TEXT NOT NULL,
          total REAL NOT NULL,
          payment_amount REAL NOT NULL,
          price_is_placeholder BOOLEAN NOT NULL DEFAULT TRUE,
          payment_method TEXT NOT NULL,
          payment_status TEXT NOT NULL DEFAULT 'pending',
          payment_id TEXT,
          razorpay_order_id TEXT,
          status TEXT NOT NULL DEFAULT 'Pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `)
      .then(() => undefined)
      .catch((error: unknown) => {
        schemaReadyPromise = undefined;
        throw error;
      });
  }
  await schemaReadyPromise;
}
