import { z } from "zod";

// 1. Auth Validation
export const RegisterLoginSchema = z.object({
  uid: z.string().min(5, "Firebase UID is required"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  role: z.enum(["customer", "admin", "support"]).optional().default("customer"),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(10, "Refresh Token is required"),
});

// 2. Product Validation
export const ProductSchema = z.object({
  id: z.string().min(2, "Product ID must be at least 2 characters"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  brand: z.string().optional(),
  price: z.number().positive("Price must be a positive integer"),
  mrp: z.number().positive("MRP must be positive").optional(),
  badge: z.string().optional(),
  category: z.string().min(2, "Category is required"),
  subcategory: z.string().min(2, "Subcategory is required"),
  images: z.array(z.string()).default([]),
  colors: z.array(z.object({ name: z.string(), value: z.string() })).default([]),
  sizes: z.array(z.string()).default([]),
  description: z.string().optional(),
  fabricCare: z.string().optional(),
  shippingReturns: z.string().optional(),
});

// 3. Cart Validation
export const AddToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export const UpdateCartQtySchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().int().nonnegative("Quantity must be non-negative"),
});

// 4. Order Validation
export const CreateOrderSchema = z.object({
  customerName: z.string().min(2, "Customer Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().min(5, "Shipping address is required"),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
      size: z.string().min(1),
      color: z.string().min(1),
    })
  ).min(1, "Order must contain at least 1 item"),
  couponCode: z.string().optional(),
  claimedTotal: z.number().positive("Claimed total must be positive"),
});

export const VerifyPaymentSchema = z.object({
  orderId: z.string().min(5, "Order ID is required"),
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().min(5),
  total: z.number().positive(),
  paymentMethod: z.string().min(2),
  items: z.array(z.any()),
  couponCode: z.string().optional(),
  gatewayPaymentId: z.string().min(5, "Gateway Payment ID is required"),
  gatewaySignature: z.string().optional(),
});

// 5. Coupon Validation
export const CreateCouponSchema = z.object({
  code: z.string().min(3, "Coupon code must be at least 3 characters"),
  discountPercentage: z.number().int().min(1).max(100),
  minSpend: z.number().positive().optional(),
  description: z.string().optional(),
});

export const ValidateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  subtotal: z.number().positive("Subtotal must be positive"),
});

// 6. Image Upload Validation
export const UploadImageSchema = z.object({
  base64Data: z.string().min(10, "Base64 image data is required"),
  filename: z.string().min(3, "Filename is required"),
});
