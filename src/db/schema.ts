import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase UID or Custom UID
  email: text("email").notNull(),
  phone: text("phone"),
  name: text("name").notNull(),
  role: text("role").notNull().default("customer"), // 'customer' | 'admin' | 'support'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users Relationships
export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  cartItems: many(cartItems),
  orders: many(orders),
}));

// 2. Refresh Tokens Table (JWT Session Management)
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

// 3. Products Table
export const products = pgTable("products", {
  id: text("id").primaryKey(), // custom product IDs (e.g., 'p1', 'p2')
  name: text("name").notNull(),
  brand: text("brand"),
  price: integer("price").notNull(), // Amount in INR
  mrp: integer("mrp"),
  badge: text("badge"),
  category: text("category"), // 'men' | 'women' | etc.
  subcategory: text("subcategory"),
  images: jsonb("images").notNull().default([]), // Array of image URL strings
  colors: jsonb("colors").notNull().default([]), // Array of { name: string, value: string }
  sizes: jsonb("sizes").notNull().default([]), // Array of size strings
  description: text("description"),
  fabricCare: text("fabric_care"),
  shippingReturns: text("shipping_returns"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products Relationships
export const productsRelations = relations(products, ({ many }) => ({
  inventory: many(inventory),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

// 4. Inventory Table
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: text("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  size: text("size").notNull(),
  color: text("color").notNull(),
  quantity: integer("quantity").notNull().default(0),
});

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
}));

// 5. Coupons Table
export const coupons = pgTable("coupons", {
  code: text("code").primaryKey(), // Coupon code (e.g. 'FESTIVE20')
  discountPercentage: integer("discount_percentage").notNull(),
  minSpend: integer("min_spend"),
  description: text("description"),
  usageCount: integer("usage_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Cart Items Table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  productId: text("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  size: text("size").notNull(),
  color: text("color").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// 7. Orders Table
export const orders = pgTable("orders", {
  id: text("id").primaryKey(), // 'ODR-xxxxxx-IN'
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("Pending"), // Pending, Processing, Shipped, etc.
  paymentMethod: text("payment_method").notNull(),
  trackingId: text("tracking_id"),
  estimatedDelivery: text("estimated_delivery"),
  returnReason: text("return_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

// 8. Order Items Table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  size: text("size").notNull(),
  color: text("color").notNull(),
  image: text("image"),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
