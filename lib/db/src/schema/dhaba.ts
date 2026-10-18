import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export type OrderLine = {
  menuItemId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  priceIsPlaceholder: boolean;
};

export const menuItemsTable = pgTable("dhaba_menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  price: real("price").notNull().default(100),
  priceIsPlaceholder: boolean("price_is_placeholder").notNull().default(true),
  available: boolean("available").notNull().default(true),
  imagePath: text("image_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const roomTypesTable = pgTable("dhaba_room_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
  pricePerNight: real("price_per_night").notNull().default(1000),
  priceIsPlaceholder: boolean("price_is_placeholder").notNull().default(true),
  imagePath: text("image_path"),
  blockedDates: jsonb("blocked_dates").$type<string[]>().notNull().default([]),
});

export const galleryImagesTable = pgTable("dhaba_gallery_images", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(),
  caption: text("caption").notNull(),
  imagePath: text("image_path"),
  isPlaceholder: boolean("is_placeholder").notNull().default(true),
});

export const ordersTable = pgTable("dhaba_orders", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  fulfillment: text("fulfillment").notNull(),
  paymentMethod: text("payment_method").notNull(),
  items: jsonb("items").$type<OrderLine[]>().notNull(),
  total: real("total").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentId: text("payment_id"),
  razorpayOrderId: text("razorpay_order_id"),
  status: text("status").notNull().default("Received"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookingsTable = pgTable("dhaba_bookings", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  checkIn: date("check_in", { mode: "string" }).notNull(),
  checkOut: date("check_out", { mode: "string" }).notNull(),
  guests: integer("guests").notNull(),
  roomTypeId: integer("room_type_id").notNull(),
  roomTypeName: text("room_type_name").notNull(),
  total: real("total").notNull(),
  paymentAmount: real("payment_amount").notNull(),
  priceIsPlaceholder: boolean("price_is_placeholder").notNull().default(true),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentId: text("payment_id"),
  razorpayOrderId: text("razorpay_order_id"),
  status: text("status").notNull().default("Pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});