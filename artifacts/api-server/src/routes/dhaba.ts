import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { and, eq, inArray, ne } from "drizzle-orm";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  bookingsTable,
  db,
  galleryImagesTable,
  menuItemsTable,
  ordersTable,
  roomTypesTable,
  type OrderLine,
} from "@workspace/db";
import {
  AdminLoginBody,
  AdminLoginResponse,
  AdminLogoutResponse,
  CreateBookingBody,
  CreateBookingResponse,
  CreateGalleryImageBody,
  CreateGalleryImageResponse,
  CreateMenuItemBody,
  CreateMenuItemResponse,
  CreateOrderBody,
  CreateOrderResponse,
  CreateRoomTypeBody,
  CreateRoomTypeResponse,
  DeleteGalleryImageParams,
  DeleteGalleryImageResponse,
  DeleteMenuItemParams,
  DeleteMenuItemResponse,
  GetAdminDashboardResponse,
  GetAdminSessionResponse,
  GetBusinessResponse,
  ListBookingsResponse,
  ListGalleryResponse,
  ListMenuResponse,
  ListOrdersResponse,
  ListRoomsResponse,
  UpdateBookingBody,
  UpdateBookingParams,
  UpdateBookingResponse,
  UpdateGalleryImageBody,
  UpdateGalleryImageParams,
  UpdateGalleryImageResponse,
  UpdateMenuItemBody,
  UpdateMenuItemParams,
  UpdateMenuItemResponse,
  UpdateOrderBody,
  UpdateOrderParams,
  UpdateOrderResponse,
  UpdateRoomTypeBody,
  UpdateRoomTypeParams,
  UpdateRoomTypeResponse,
  VerifyPaymentBody,
  VerifyPaymentResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const gallerySections = [
  "Food",
  "Rooms",
  "Pool",
  "Lawn/Events",
  "Sitting Area",
  "Corridors",
];
const categories = [
  "Drinks",
  "Desserts",
  "Thalis",
  "Salads",
  "Dal & Lentils",
  "Breads",
  "Raita & Curd",
  "Vegetarian Curries",
  "Paneer & Main Course",
  "Snacks",
  "Noodles & Starters",
  "Rice & Pulao"
];
const initialMenu = [
  ["Regular Tea", "Drinks", "Regular Indian milk tea.", 15],
  ["Special Tea", "Drinks", "Specially prepared Indian milk tea.", 20],
  ["Packaged Water", "Drinks", "Bottled drinking water.", 20],
  ["Coffee", "Drinks", "Hot coffee.", 30],
  ["Cold Coffee", "Drinks", "Chilled coffee beverage.", 80],
  ["Lassi", "Drinks", "Traditional chilled yogurt drink.", 50],
  ["Tandoori Tea", "Drinks", "Smoky-style tandoori chai.", 50],
  ["Kheer", "Desserts", "Traditional rice pudding.", 60],
  ["Cold Drink", "Drinks", "Soft drink; price varies by brand and size.", 0],
  ["Ice Cream", "Desserts", "Ice cream; price varies by flavour and serving.", 0],
  ["Regular Thali", "Thalis", "Dal fry, matar paneer, seasonal vegetables, rice, four rotis, papad and salad.", 200],
  ["Special Thali", "Thalis", "Dal makhani, mixed vegetables, paneer butter masala, matar pulao, bread selection, two butter rotis, sweet, salad and papad.", 250],
  ["Onion Salad", "Salads", "Fresh onion salad.", 20],
  ["Cucumber Salad", "Salads", "Fresh cucumber salad.", 30],
  ["Green Salad", "Salads", "Fresh seasonal green salad.", 60],
  ["Arhar Dal Fry", "Dal & Lentils", "Arhar dal prepared in a traditional style.", 90],
  ["Mixed Dal", "Dal & Lentils", "Mixed lentils cooked with Indian spices.", 100],
  ["Urad Rajma Dal", "Dal & Lentils", "Urad dal and kidney bean preparation.", 90],
  ["Dal Tadka", "Dal & Lentils", "Yellow lentils tempered with spices.", 110],
  ["Butter Dal Fry", "Dal & Lentils", "Dal fry finished with butter.", 110],
  ["Punjabi Tadka Dal", "Dal & Lentils", "Punjabi-style dal with a robust tempering.", 110],
  ["Dal Makhani", "Dal & Lentils", "Slow-style black lentils enriched with butter and cream.", 120],
  ["Tandoori Roti", "Breads", "Traditional tandoor-baked wheat flatbread.", 10],
  ["Butter Tandoori Roti", "Breads", "Tandoori roti finished with butter.", 12],
  ["Lachha Paratha", "Breads", "Layered Indian flatbread.", 30],
  ["Missi Roti", "Breads", "Gram-flour and wheat flatbread.", 30],
  ["Plain Naan", "Breads", "Soft tandoor-baked naan.", 30],
  ["Butter Naan", "Breads", "Naan finished with butter.", 40],
  ["Kashmiri Naan", "Breads", "Kashmiri-style sweet and nutty naan.", 60],
  ["Garlic Naan", "Breads", "Naan topped with garlic.", 60],
  ["Aloo Stuffed Naan", "Breads", "Naan stuffed with potato.", 80],
  ["Paneer Stuffed Naan", "Breads", "Naan stuffed with paneer.", 110],
  ["Mixed Stuffed Naan", "Breads", "Naan with mixed stuffing.", 90],
  ["Aloo Paratha", "Breads", "Wheat flatbread stuffed with spiced potato.", 70],
  ["Paneer Paratha", "Breads", "Wheat flatbread stuffed with paneer.", 100],
  ["Mixed Paratha", "Breads", "Paratha with mixed stuffing.", 90],
  ["Boondi Raita", "Raita & Curd", "Yogurt with boondi.", 90],
  ["Onion Raita", "Raita & Curd", "Yogurt with onion.", 80],
  ["Mixed Raita", "Raita & Curd", "Yogurt with mixed ingredients.", 90],
  ["Plain Curd", "Raita & Curd", "Plain fresh curd.", 80],
  ["Plain Raita", "Raita & Curd", "Seasoned yogurt raita.", 80],
  ["Aloo Jeera", "Vegetarian Curries", "Potatoes tossed with cumin.", 90],
  ["Aloo Tomato", "Vegetarian Curries", "Potato and tomato curry.", 100],
  ["Aloo Dum", "Vegetarian Curries", "Spiced dum-style potato curry.", 150],
  ["Kashmiri Aloo Dum", "Vegetarian Curries", "Kashmiri-style potato curry.", 250],
  ["Stuffed Tomato", "Vegetarian Curries", "Tomatoes stuffed with spiced filling.", 200],
  ["Sev Bhaji", "Vegetarian Curries", "Traditional curry with sev.", 130],
  ["Sev Masala", "Vegetarian Curries", "Sev in a spiced gravy.", 110],
  ["Sev Tomato", "Vegetarian Curries", "Tomato curry with sev.", 120],
  ["Matar Masala", "Vegetarian Curries", "Green peas in masala gravy.", 150],
  ["Mixed Vegetables", "Vegetarian Curries", "Seasonal mixed vegetable curry.", 150],
  ["Seasonal Vegetable", "Vegetarian Curries", "Seasonal vegetable preparation.", 90],
  ["Matar Paneer", "Paneer & Main Course", "Paneer and green peas in tomato gravy.", 200],
  ["Kadai Paneer", "Paneer & Main Course", "Paneer cooked with peppers and kadai spices.", 220],
  ["Handi Paneer", "Paneer & Main Course", "Paneer in a rich handi-style gravy.", 230],
  ["Paneer Butter Masala", "Paneer & Main Course", "Paneer in a creamy tomato-butter gravy.", 220],
  ["Shahi Paneer", "Paneer & Main Course", "Paneer in a rich shahi gravy.", 220],
  ["Khoya Paneer", "Paneer & Main Course", "Paneer curry enriched with khoya.", 240],
  ["Malai Paneer", "Paneer & Main Course", "Paneer in a creamy malai gravy.", 240],
  ["Paneer Kali Mirch", "Paneer & Main Course", "Paneer flavoured with black pepper.", 250],
  ["Paneer Korma", "Paneer & Main Course", "Paneer in a rich korma gravy.", 280],
  ["Mushroom Paneer", "Paneer & Main Course", "Mushroom and paneer curry.", 250],
  ["Mushroom Masala", "Paneer & Main Course", "Mushrooms in spiced masala gravy.", 260],
  ["Chilli Paneer Dry", "Paneer & Main Course", "Dry Indo-Chinese chilli paneer.", 210],
  ["Chilli Paneer Gravy", "Paneer & Main Course", "Chilli paneer served with gravy.", 240],
  ["Paneer Do Pyaza", "Paneer & Main Course", "Paneer and onion curry.", 230],
  ["Paneer Fry Masala", "Paneer & Main Course", "Paneer in a spiced masala preparation.", 200],
  ["Veg Kofta", "Paneer & Main Course", "Vegetable dumplings in curry.", 240],
  ["Malai Kofta", "Paneer & Main Course", "Soft kofta in a creamy gravy.", 270],
  ["Paneer Bhurji", "Paneer & Main Course", "Crumbled paneer cooked with spices.", 270],
  ["Paneer Pasanda", "Paneer & Main Course", "Paneer in a rich pasanda gravy.", 290],
  ["Kaju Paneer", "Paneer & Main Course", "Paneer and cashew curry.", 270],
  ["Kaju Curry", "Paneer & Main Course", "Cashews in a rich curry.", 300],
  ["Dry Papad", "Snacks", "Crisp roasted papad.", 20],
  ["Fried Papad", "Snacks", "Crisp fried papad.", 30],
  ["Masala Papad", "Snacks", "Papad topped with masala.", 60],
  ["Vegetable Cutlet", "Snacks", "Crisp vegetable cutlets.", 220],
  ["Paneer Pakora", "Snacks", "Paneer fritters.", 150],
  ["Mixed Pakora", "Snacks", "Assorted vegetable fritters.", 140],
  ["Onion Pakora", "Snacks", "Crisp onion fritters.", 120],
  ["Chilli Potato", "Snacks", "Crispy potatoes tossed in chilli sauce.", 220],
  ["Honey Potato", "Snacks", "Crispy potatoes with honey-style sauce.", 220],
  ["Plain Maggi", "Noodles & Starters", "Classic masala-style instant noodles.", 50],
  ["Vegetable Maggi", "Noodles & Starters", "Instant noodles with vegetables.", 80],
  ["Paneer Maggi", "Noodles & Starters", "Noodles with paneer.", 100],
  ["Aloo Tikki", "Noodles & Starters", "Crisp potato patties.", 150],
  ["Vegetable Noodles", "Noodles & Starters", "Stir-fried vegetable noodles.", 140],
  ["Paneer Noodles", "Noodles & Starters", "Noodles with paneer.", 160],
  ["Paneer Tikka", "Noodles & Starters", "Marinated paneer grilled with spices.", 320],
  ["King Chips", "Noodles & Starters", "Crispy chips starter.", 160],
  ["Chilli Dragon", "Noodles & Starters", "Spicy Indo-Chinese starter.", 250],
  ["Vegetable Manchurian", "Noodles & Starters", "Vegetable dumplings in Manchurian sauce.", 200],
  ["Paneer Manchurian", "Noodles & Starters", "Paneer in Manchurian sauce.", 240],
  ["Plain Rice", "Rice & Pulao", "Steamed plain rice.", 70],
  ["Jeera Rice", "Rice & Pulao", "Rice tempered with cumin.", 80],
  ["Fried Rice", "Rice & Pulao", "Indo-Chinese vegetable fried rice.", 120],
  ["Fried Rice Chowmein", "Rice & Pulao", "Menu item listed as fried rice chowmein; confirm exact preparation.", 160],
  ["Vegetable Pulao", "Rice & Pulao", "Fragrant vegetable pulao.", 140],
  ["Paneer Pulao", "Rice & Pulao", "Rice pulao with paneer.", 180],
  ["Matar Pulao", "Rice & Pulao", "Rice pulao with green peas.", 120],
  ["Mushroom Pulao", "Rice & Pulao", "Rice pulao with mushrooms.", 160],
] as const;
const initialRooms = [
  ["Premium AC Rooms", "A comfortable air-conditioned room for a rest on the road.", 1800],
  ["Non-AC Rooms", "A practical room for a simple, comfortable stay.", 1000],
] as const;

let seedPromise: Promise<void> | undefined;

async function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      await db
        .insert(menuItemsTable)
        .values(
          initialMenu.map(([name, category, description, price]) => ({
            name,
            category,
            description,
            price,
            priceIsPlaceholder: price === 0,
            available: true,
          })),
        )
        .onConflictDoNothing();
      // Update legacy starter rows only while their prices are still marked unconfirmed.
      // Owner-verified prices and availability are never overwritten by the seed routine.
      for (const [name, category, description, price] of initialMenu) {
        if (price === 0) continue;
        await db.update(menuItemsTable).set({ category, description, price, priceIsPlaceholder: false })
          .where(and(eq(menuItemsTable.name, name), eq(menuItemsTable.priceIsPlaceholder, true)));
      }
      // Hide only the original demo rows that were never part of the supplied printed menu.
      await db.update(menuItemsTable).set({ available: false })
        .where(and(inArray(menuItemsTable.name, ["Sweet Lassi", "Veg Fried Rice", "Special Kheer", "Noodles", "Daal", "Roti"]), eq(menuItemsTable.priceIsPlaceholder, true)));
      await db
        .insert(roomTypesTable)
        .values(
          initialRooms.map(([name, description, pricePerNight]) => ({
            name,
            description,
            pricePerNight,
            priceIsPlaceholder: true,
            blockedDates: [],
          })),
        )
        .onConflictDoNothing();
      await db
        .insert(galleryImagesTable)
        .values(
          gallerySections.map((section) => ({
            section,
            caption: "Add real photo here",
            imagePath: null,
            isPlaceholder: true,
          })),
        )
        .onConflictDoNothing();
    })().catch((error: unknown) => {
      seedPromise = undefined;
      throw error;
    });
  }
  await seedPromise;
}

function envIsConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD &&
      process.env.SESSION_SECRET,
  );
}

function signature(value: string): string {
  return createHmac("sha256", process.env.SESSION_SECRET ?? "")
    .update(value)
    .digest("base64url");
}

function hasAdminSession(req: Request): boolean {
  const cookieHeader = req.headers.cookie ?? "";
  const rawCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("tiwari_admin="))
    ?.slice("tiwari_admin=".length);
  if (!rawCookie || !process.env.SESSION_SECRET) return false;
  const [payload, suppliedSignature] = rawCookie.split(".");
  if (!payload || !suppliedSignature) return false;
  const expected = Buffer.from(signature(payload));
  const actual = Buffer.from(suppliedSignature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return false;
  }
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      exp: number;
    };
    return session.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response): boolean {
  if (hasAdminSession(req)) return true;
  res.status(401).json({ error: "Owner login required." });
  return false;
}

export { requireAdmin as requireDhabaAdmin };

function setAdminCookie(res: Response): void {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + 1000 * 60 * 60 * 12 }),
  ).toString("base64url");
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `tiwari_admin=${payload}.${signature(payload)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200${secure}`,
  );
}

function clearAdminCookie(res: Response): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `tiwari_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
}

function sendInvalid(res: Response, message: string): void {
  res.status(400).json({ error: message });
}

function orderForApi<T extends { createdAt: Date }>(row: T): Omit<T, "createdAt"> & { createdAt: string } {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

function bookingForApi<T extends { createdAt: Date }>(
  row: T,
): Omit<T, "createdAt"> & { createdAt: string } {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

function makeReference(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round(
    (Date.parse(`${checkOut}T00:00:00Z`) -
      Date.parse(`${checkIn}T00:00:00Z`)) /
      86_400_000,
  );
}

function bookingPaymentAmount(total: number): number {
  if (process.env.BOOKING_PAYMENT_MODE !== "token") return total;
  const tokenAmount = Number(process.env.BOOKING_TOKEN_AMOUNT ?? "500");
  if (!Number.isFinite(tokenAmount) || tokenAmount <= 0) {
    throw new Error("BOOKING_TOKEN_AMOUNT must be a positive amount.");
  }
  return Math.min(total, Math.round(tokenAmount * 100) / 100);
}

function isDateBlocked(dates: string[], checkIn: string, checkOut: string): boolean {
  return dates.some((date) => date >= checkIn && date < checkOut);
}

function safeEqualText(expected: string, actual: string): boolean {
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}

function razorpayCredentials(): { keyId: string; keySecret: string } | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? { keyId, keySecret } : null;
}

type PaymentKind = "order" | "booking";

async function createRazorpayOrder(
  kind: PaymentKind,
  id: number,
  amount: number,
  reference: string,
  existingOrderId?: string | null,
): Promise<{ keyId: string; orderId: string } | null> {
  const credentials = razorpayCredentials();
  if (!credentials) return null;
  if (existingOrderId) {
    return { keyId: credentials.keyId, orderId: existingOrderId };
  }
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${credentials.keyId}:${credentials.keySecret}`,
      ).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: reference,
      notes: { kind, recordId: String(id), reference },
    }),
  });
  if (!response.ok) {
    throw new Error(`Razorpay order creation failed (${response.status}).`);
  }
  const data = (await response.json()) as { id?: string };
  if (!data.id) throw new Error("Razorpay did not return an order ID.");
  return { keyId: credentials.keyId, orderId: data.id };
}

async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  suppliedSignature: string,
  expectedAmount: number,
): Promise<boolean> {
  const credentials = razorpayCredentials();
  if (!credentials) return false;
  const expectedSignature = createHmac("sha256", credentials.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  if (!safeEqualText(expectedSignature, suppliedSignature)) return false;

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${credentials.keyId}:${credentials.keySecret}`,
        ).toString("base64")}`,
      },
    },
  );
  if (!response.ok) return false;
  const payment = (await response.json()) as {
    order_id?: string;
    amount?: number;
    currency?: string;
    status?: string;
  };
  return (
    payment.order_id === orderId &&
    payment.amount === Math.round(expectedAmount * 100) &&
    payment.currency === "INR" &&
    (payment.status === "captured" || payment.status === "authorized")
  );
}

router.use(async (_req, _res, next) => {
  try {
    await ensureSeed();
    next();
  } catch (error) {
    next(error);
  }
});

router.get("/business", (_req, res) => {
  res.json(
    GetBusinessResponse.parse({
      name: "Tiwari Dhaba",
      type: "Pure vegetarian dhaba",
      location: "Kanpur, Uttar Pradesh, India",
      priceRange: "Varies by menu item",
      rating: 0,
      reviewCount: "Not connected to Google yet",
      categories,
      hours: "Open 24 hours, every day",
      whatsappNumber: process.env.OWNER_WHATSAPP_NUMBER ?? null,
    }),
  );
});

router.get("/menu", async (_req, res): Promise<void> => {
  const rows = await db.select().from(menuItemsTable).orderBy(menuItemsTable.id);
  res.json(ListMenuResponse.parse(rows));
});

router.post("/menu", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const parsed = CreateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    sendInvalid(res, parsed.error.message);
    return;
  }
  const [item] = await db
    .insert(menuItemsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateMenuItemResponse.parse(item));
});

router.patch("/menu/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const params = UpdateMenuItemParams.safeParse(req.params);
  const body = UpdateMenuItemBody.safeParse(req.body);
  if (!params.success || !body.success) {
    sendInvalid(res, !params.success ? params.error.message : body.error?.message ?? "Invalid request.");
    return;
  }
  const [item] = await db
    .update(menuItemsTable)
    .set(body.data)
    .where(eq(menuItemsTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Menu item not found." });
    return;
  }
  res.json(UpdateMenuItemResponse.parse(item));
});

router.delete("/menu/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const params = DeleteMenuItemParams.safeParse(req.params);
  if (!params.success) {
    sendInvalid(res, params.error.message);
    return;
  }
  await db.delete(menuItemsTable).where(eq(menuItemsTable.id, params.data.id));
  res.status(204).json(DeleteMenuItemResponse.parse(undefined));
});

router.get("/rooms", async (_req, res): Promise<void> => {
  const rows = await db.select().from(roomTypesTable).orderBy(roomTypesTable.id);
  res.json(ListRoomsResponse.parse(rows));
});

router.post("/rooms", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const parsed = CreateRoomTypeBody.safeParse(req.body);
  if (!parsed.success) {
    sendInvalid(res, parsed.error.message);
    return;
  }
  const [room] = await db
    .insert(roomTypesTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateRoomTypeResponse.parse(room));
});

router.patch("/rooms/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const params = UpdateRoomTypeParams.safeParse(req.params);
  const body = UpdateRoomTypeBody.safeParse(req.body);
  if (!params.success || !body.success) {
    sendInvalid(res, !params.success ? params.error.message : body.error?.message ?? "Invalid request.");
    return;
  }
  const [room] = await db
    .update(roomTypesTable)
    .set(body.data)
    .where(eq(roomTypesTable.id, params.data.id))
    .returning();
  if (!room) {
    res.status(404).json({ error: "Room type not found." });
    return;
  }
  res.json(UpdateRoomTypeResponse.parse(room));
});

router.get("/gallery", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(galleryImagesTable)
    .orderBy(galleryImagesTable.id);
  res.json(ListGalleryResponse.parse(rows));
});

router.post("/gallery", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const parsed = CreateGalleryImageBody.safeParse(req.body);
  if (!parsed.success) {
    sendInvalid(res, parsed.error.message);
    return;
  }
  const [image] = await db
    .insert(galleryImagesTable)
    .values({
      ...parsed.data,
      imagePath: parsed.data.imagePath ?? null,
      isPlaceholder: !parsed.data.imagePath,
    })
    .returning();
  res.status(201).json(CreateGalleryImageResponse.parse(image));
});

router.patch("/gallery/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const params = UpdateGalleryImageParams.safeParse(req.params);
  const body = UpdateGalleryImageBody.safeParse(req.body);
  if (!params.success || !body.success) {
    sendInvalid(res, !params.success ? params.error.message : body.error?.message ?? "Invalid request.");
    return;
  }
  const [image] = await db
    .update(galleryImagesTable)
    .set({
      ...body.data,
      ...(body.data.imagePath !== undefined
        ? { isPlaceholder: !body.data.imagePath }
        : {}),
    })
    .where(eq(galleryImagesTable.id, params.data.id))
    .returning();
  if (!image) {
    res.status(404).json({ error: "Gallery image not found." });
    return;
  }
  res.json(UpdateGalleryImageResponse.parse(image));
});

router.delete("/gallery/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const params = DeleteGalleryImageParams.safeParse(req.params);
  if (!params.success) {
    sendInvalid(res, params.error.message);
    return;
  }
  await db
    .delete(galleryImagesTable)
    .where(eq(galleryImagesTable.id, params.data.id));
  res.status(204).json(DeleteGalleryImageResponse.parse(undefined));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    sendInvalid(res, parsed.error.message);
    return;
  }
  const requestedIds = [...new Set(parsed.data.items.map((item) => item.menuItemId))];
  const menuItems = await db
    .select()
    .from(menuItemsTable)
    .where(inArray(menuItemsTable.id, requestedIds));
  const byId = new Map(menuItems.map((item) => [item.id, item]));
  const lines: OrderLine[] = [];
  for (const line of parsed.data.items) {
    const item = byId.get(line.menuItemId);
    if (!item || !item.available) {
      res.status(400).json({ error: "An item is unavailable. Please update your cart." });
      return;
    }
    lines.push({
      menuItemId: item.id,
      name: item.name,
      quantity: line.quantity,
      unitPrice: item.price,
      priceIsPlaceholder: item.priceIsPlaceholder,
    });
  }
  const total = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const [order] = await db
    .insert(ordersTable)
    .values({
      reference: makeReference("TD"),
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      fulfillment: parsed.data.fulfillment,
      paymentMethod: parsed.data.paymentMethod,
      items: lines,
      total,
      paymentStatus: "pending",
      status: "Received",
    })
    .returning();
  res.status(201).json(CreateOrderResponse.parse(orderForApi(order)));
});

router.get("/orders", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const rows = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.createdAt);
  res.json(ListOrdersResponse.parse(rows.reverse().map(orderForApi)));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const params = UpdateOrderParams.safeParse(req.params);
  const body = UpdateOrderBody.safeParse(req.body);
  if (!params.success || !body.success) {
    sendInvalid(res, !params.success ? params.error.message : body.error?.message ?? "Invalid request.");
    return;
  }
  const [order] = await db
    .update(ordersTable)
    .set(body.data)
    .where(eq(ordersTable.id, params.data.id))
    .returning();
  if (!order) {
    res.status(404).json({ error: "Order not found." });
    return;
  }
  res.json(UpdateOrderResponse.parse(orderForApi(order)));
});

router.post("/orders/:id/payment", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id < 1) {
    sendInvalid(res, "Invalid order ID.");
    return;
  }
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id));
  if (!order) {
    res.status(404).json({ error: "Order not found." });
    return;
  }
  if (order.paymentStatus === "paid") {
    res.status(409).json({ error: "This order is already paid." });
    return;
  }
  if (order.items.some((item) => item.priceIsPlaceholder)) {
    res.status(409).json({
      error: "Online payment is disabled until the owner confirms all item prices.",
    });
    return;
  }
  const checkout = await createRazorpayOrder(
    "order",
    order.id,
    order.total,
    order.reference,
    order.razorpayOrderId,
  );
  if (!checkout) {
    res.status(503).json({
      error: "Online payment is not configured yet. Your order is saved; choose Pay at Counter or try again after Razorpay test keys are set.",
    });
    return;
  }
  await db
    .update(ordersTable)
    .set({ razorpayOrderId: checkout.orderId, paymentMethod: "online" })
    .where(eq(ordersTable.id, order.id));
  res.json({
    keyId: checkout.keyId,
    razorpayOrderId: checkout.orderId,
    amount: Math.round(order.total * 100),
    currency: "INR",
  });
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    sendInvalid(res, parsed.error.message);
    return;
  }
  const checkIn =
    parsed.data.checkIn instanceof Date
      ? parsed.data.checkIn.toISOString().slice(0, 10)
      : parsed.data.checkIn;
  const checkOut =
    parsed.data.checkOut instanceof Date
      ? parsed.data.checkOut.toISOString().slice(0, 10)
      : parsed.data.checkOut;
  const stayNights = nightsBetween(checkIn, checkOut);
  if (
    stayNights < 1 ||
    checkIn < new Date().toISOString().slice(0, 10)
  ) {
    sendInvalid(res, "Check-out must be after check-in, and check-in cannot be in the past.");
    return;
  }
  const [room] = await db
    .select()
    .from(roomTypesTable)
    .where(eq(roomTypesTable.id, parsed.data.roomTypeId));
  if (!room) {
    res.status(404).json({ error: "Room type not found." });
    return;
  }
  const roomBlockedDates = room.blockedDates ?? [];
  if (isDateBlocked(roomBlockedDates, checkIn, checkOut)) {
    res.status(409).json({ error: "That room type is not available for those dates." });
    return;
  }
  const existing = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.roomTypeId, room.id),
        ne(bookingsTable.status, "Rejected"),
      ),
    );
  if (
    existing.some(
      (booking) =>
        booking.checkIn < checkOut &&
        booking.checkOut > checkIn,
    )
  ) {
    res.status(409).json({ error: "Those dates are already requested for this room type. Please contact the dhaba." });
    return;
  }
  const [booking] = await db
    .insert(bookingsTable)
    .values({
      reference: makeReference("TB"),
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      checkIn,
      checkOut,
      guests: parsed.data.guests,
      roomTypeId: room.id,
      roomTypeName: room.name,
      total: room.pricePerNight * stayNights,
      paymentAmount: bookingPaymentAmount(room.pricePerNight * stayNights),
      priceIsPlaceholder: room.priceIsPlaceholder,
      paymentMethod: parsed.data.paymentMethod,
      paymentStatus: "pending",
      status: "Pending",
    })
    .returning();
  res.status(201).json(
    CreateBookingResponse.parse({
      ...bookingForApi(booking),
      roomTypeName: room.name,
    }),
  );
});

router.get("/bookings", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const rows = await db
    .select()
    .from(bookingsTable)
    .orderBy(bookingsTable.createdAt);
  res.json(ListBookingsResponse.parse(rows.reverse().map(bookingForApi)));
});

router.patch("/bookings/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const params = UpdateBookingParams.safeParse(req.params);
  const body = UpdateBookingBody.safeParse(req.body);
  if (!params.success || !body.success) {
    sendInvalid(res, !params.success ? params.error.message : body.error?.message ?? "Invalid request.");
    return;
  }
  const [booking] = await db
    .update(bookingsTable)
    .set(body.data)
    .where(eq(bookingsTable.id, params.data.id))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found." });
    return;
  }
  res.json(UpdateBookingResponse.parse(bookingForApi(booking)));
});

router.post("/bookings/:id/payment", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id < 1) {
    sendInvalid(res, "Invalid booking ID.");
    return;
  }
  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ error: "Booking not found." });
    return;
  }
  if (booking.paymentStatus === "paid") {
    res.status(409).json({ error: "This booking is already paid." });
    return;
  }
  const [room] = await db
    .select()
    .from(roomTypesTable)
    .where(eq(roomTypesTable.id, booking.roomTypeId));
  if (room?.priceIsPlaceholder) {
    res.status(409).json({
      error: "Online payment is disabled until the owner confirms this room price.",
    });
    return;
  }
  const checkout = await createRazorpayOrder(
    "booking",
    booking.id,
    booking.paymentAmount,
    booking.reference,
    booking.razorpayOrderId,
  );
  if (!checkout) {
    res.status(503).json({
      error: "Online payment is not configured yet. Your booking request is saved; choose Pay at Counter or try again after Razorpay test keys are set.",
    });
    return;
  }
  await db
    .update(bookingsTable)
    .set({ razorpayOrderId: checkout.orderId, paymentMethod: "online" })
    .where(eq(bookingsTable.id, booking.id));
  res.json({
    keyId: checkout.keyId,
    razorpayOrderId: checkout.orderId,
    amount: Math.round(booking.paymentAmount * 100),
    currency: "INR",
  });
});

router.post("/payments/verify", async (req, res): Promise<void> => {
  const parsed = VerifyPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    sendInvalid(res, parsed.error.message);
    return;
  }
  const { kind, recordId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
    parsed.data;
  if (kind === "order") {
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, recordId));
    if (!order || order.razorpayOrderId !== razorpayOrderId) {
      res.status(404).json({ error: "The payment does not match a saved order." });
      return;
    }
    const verified = await verifyRazorpayPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      order.total,
    );
    if (!verified) {
      res.status(400).json({ error: "Payment verification failed. You can safely retry checkout." });
      return;
    }
    const [updated] = await db
      .update(ordersTable)
      .set({ paymentStatus: "paid", paymentId: razorpayPaymentId })
      .where(eq(ordersTable.id, order.id))
      .returning();
    res.json(
      VerifyPaymentResponse.parse({
        verified: true,
        reference: updated.reference,
        paymentStatus: updated.paymentStatus,
      }),
    );
    return;
  }
  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, recordId));
  if (!booking || booking.razorpayOrderId !== razorpayOrderId) {
    res.status(404).json({ error: "The payment does not match a saved booking." });
    return;
  }
  const verified = await verifyRazorpayPayment(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    booking.paymentAmount,
  );
  if (!verified) {
    res.status(400).json({ error: "Payment verification failed. You can safely retry checkout." });
    return;
  }
  const [updated] = await db
    .update(bookingsTable)
    .set({ paymentStatus: "paid", paymentId: razorpayPaymentId })
    .where(eq(bookingsTable.id, booking.id))
    .returning();
  res.json(
    VerifyPaymentResponse.parse({
      verified: true,
      reference: updated.reference,
      paymentStatus: updated.paymentStatus,
    }),
  );
});

router.post("/admin/login", (req, res): void => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    sendInvalid(res, parsed.error.message);
    return;
  }
  if (!envIsConfigured()) {
    res.status(503).json({
      error: "Owner login is not configured. Add ADMIN_EMAIL and ADMIN_PASSWORD in Secrets to enable the admin panel.",
    });
    return;
  }
  const valid =
    safeEqualText(process.env.ADMIN_EMAIL ?? "", parsed.data.email) &&
    safeEqualText(process.env.ADMIN_PASSWORD ?? "", parsed.data.password);
  if (!valid) {
    res.status(401).json({ error: "Email or password is incorrect." });
    return;
  }
  setAdminCookie(res);
  res.json(AdminLoginResponse.parse({ authenticated: true, configured: true }));
});

router.get("/admin/session", (req, res): void => {
  res.json(
    GetAdminSessionResponse.parse({
      authenticated: hasAdminSession(req),
      configured: envIsConfigured(),
    }),
  );
});

router.post("/admin/logout", (_req, res): void => {
  clearAdminCookie(res);
  res.json(AdminLogoutResponse.parse({ authenticated: false, configured: envIsConfigured() }));
});

router.get("/admin/dashboard", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const [allOrders, allBookings] = await Promise.all([
    db.select().from(ordersTable).orderBy(ordersTable.createdAt),
    db.select().from(bookingsTable).orderBy(bookingsTable.createdAt),
  ]);
  const nowInIndia = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const dashboard = {
    openOrders: allOrders.filter((item) => item.status !== "Completed").length,
    pendingBookings: allBookings.filter((item) => item.status === "Pending").length,
    todayOrders: allOrders.filter(
      (item) =>
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(item.createdAt) === nowInIndia,
    ).length,
    recentOrders: allOrders.reverse().slice(0, 5).map(orderForApi),
    recentBookings: allBookings.reverse().slice(0, 5).map(bookingForApi),
  };
  res.json(GetAdminDashboardResponse.parse(dashboard));
});

export default router;