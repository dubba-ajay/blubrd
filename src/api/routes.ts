import { Router } from "express";
import { z } from "zod";
import { ProductRepository } from "../db/repositories/ProductRepository.ts";
import { CartRepository } from "../db/repositories/CartRepository.ts";
import { OrderRepository } from "../db/repositories/OrderRepository.ts";
import { CouponRepository } from "../db/repositories/CouponRepository.ts";
import { AuthService } from "../db/services/AuthService.ts";
import { OrderService } from "../db/services/OrderService.ts";
import { StorageService } from "../db/services/StorageService.ts";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth.ts";
import * as val from "./validation.ts";
import { BLOG_POSTS } from "../data/products.ts";

export const apiRouter = Router();

// Instantiate layers
const productRepo = new ProductRepository();
const cartRepo = new CartRepository();
const orderRepo = new OrderRepository();
const couponRepo = new CouponRepository();

const authService = new AuthService();
const orderService = new OrderService();
const storageService = new StorageService();

// ==========================================
// 1. AUTHENTICATION & SESSIONS
// ==========================================

// Register or Login via Firebase Identity ID token verification
apiRouter.post("/auth/register-login", async (req, res, next) => {
  try {
    const data = val.RegisterLoginSchema.parse(req.body);
    const result = await authService.loginOrRegister(data);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map(e => e.message).join(", ") });
    }
    next(error);
  }
});

// Refresh Access Token
apiRouter.post("/auth/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = val.RefreshTokenSchema.parse(req.body);
    const result = await authService.refreshSession(refreshToken);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map(e => e.message).join(", ") });
    }
    next(error);
  }
});

// Revoke Refresh Token / Logout
apiRouter.post("/auth/logout", async (req, res, next) => {
  try {
    const { refreshToken } = val.RefreshTokenSchema.parse(req.body);
    await authService.logout(refreshToken);
    res.json({ success: true, message: "Logged out and token revoked successfully." });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. PRODUCTS & INVENTORY
// ==========================================

// Get list of products with optional filters
apiRouter.get("/products", async (req, res, next) => {
  try {
    const { category, subcategory, search } = req.query;
    const prods = await productRepo.findAll({
      category: category as string,
      subcategory: subcategory as string,
      search: search as string,
    });
    res.json(prods);
  } catch (error) {
    next(error);
  }
});

// Get a single product by ID (including inventory and reviews)
apiRouter.get("/products/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const prod = await productRepo.findById(id);
    if (!prod) {
      return res.status(404).json({ error: "Product not found" });
    }
    const inv = await productRepo.getInventory(id);
    res.json({
      ...prod,
      inventory: inv,
    });
  } catch (error) {
    next(error);
  }
});

// Create or update product (Admin / Support only)
apiRouter.post("/products", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = val.ProductSchema.parse(req.body);
    const prod = await productRepo.upsertProduct(data);
    res.json({ success: true, product: prod });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map(e => e.message).join(", ") });
    }
    next(error);
  }
});

// Delete product (Admin only)
apiRouter.delete("/products/:id", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    await productRepo.deleteProduct(id);
    res.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. CART SYSTEM (SECURE CLOUD-SYNC)
// ==========================================

// Fetch user's cart
apiRouter.get("/cart", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const items = await cartRepo.getByUserId(req.user!.id);
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// Add item to cart
apiRouter.post("/cart/add", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = val.AddToCartSchema.parse(req.body);
    const item = await cartRepo.addItem(
      req.user!.id,
      data.productId,
      data.size,
      data.color,
      data.quantity
    );
    res.json({ success: true, item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map(e => e.message).join(", ") });
    }
    next(error);
  }
});

// Update cart quantity
apiRouter.post("/cart/update", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = val.UpdateCartQtySchema.parse(req.body);
    const item = await cartRepo.updateQuantity(req.user!.id, data.id, data.quantity);
    res.json({ success: true, item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map(e => e.message).join(", ") });
    }
    next(error);
  }
});

// Remove cart item
apiRouter.delete("/cart/remove/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }
    await cartRepo.removeItem(req.user!.id, id);
    res.json({ success: true, message: "Item removed from cart." });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 4. ORDERS & PAYMENTS (Razorpay & Verification)
// ==========================================

// Create/initiate a new order (Server-side price verification & inventory check)
apiRouter.post("/orders/create", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const data = val.CreateOrderSchema.parse(req.body);
    const verifiedContext = await orderService.verifyAndCreatePendingOrder({
      userId: req.user!.id,
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      items: data.items,
      couponCode: data.couponCode,
      claimedTotal: data.claimedTotal,
    });

    res.json({
      gatewayOrderId: verifiedContext.orderId,
      amount: verifiedContext.total,
      currency: "INR",
      couponApplied: verifiedContext.couponCode,
      discount: verifiedContext.discount,
      verifiedItems: verifiedContext.verifiedItems,
      publicKey: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_bluberd_pub",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map(e => e.message).join(", ") });
    }
    res.status(400).json({ error: error instanceof Error ? error.message : "Order verification failed" });
  }
});

// Verify signature and finalize payment (Atomic checkout with inventory reductions)
apiRouter.post("/orders/verify-payment", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const data = val.VerifyPaymentSchema.parse(req.body);
    const result = await orderService.completeOrder({
      orderId: data.orderId,
      userId: req.user!.id,
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      total: data.total,
      paymentMethod: data.paymentMethod,
      items: data.items,
      couponCode: data.couponCode,
      gatewayPaymentId: data.gatewayPaymentId,
      gatewaySignature: data.gatewaySignature,
    });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map(e => e.message).join(", ") });
    }
    res.status(400).json({ error: error instanceof Error ? error.message : "Payment finalization failed" });
  }
});

// Fetch logged-in user's orders
apiRouter.get("/orders/user", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const ordersList = await orderRepo.findByUserId(req.user!.id);
    res.json(ordersList);
  } catch (error) {
    next(error);
  }
});

// Admin/Support view all orders
apiRouter.get("/orders/all", requireAuth, requireRole(["admin", "support"]), async (_req: AuthenticatedRequest, res, next) => {
  try {
    const ordersList = await orderRepo.findAll();
    res.json(ordersList);
  } catch (error) {
    next(error);
  }
});

// Admin update order status (Processing, Shipped, etc.)
apiRouter.put("/orders/:id/status", requireAuth, requireRole(["admin", "support"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status, trackingId, estimatedDelivery } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Missing new status" });
    }
    const order = await orderRepo.updateStatus(id, status, trackingId, estimatedDelivery);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// Admin refund route
apiRouter.post("/orders/:id/refund", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const order = await orderRepo.refundOrder(id, reason || "Customer requested refund");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({
      success: true,
      refundId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      order,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 5. COUPONS & DISCOUNTS
// ==========================================

// Validate coupon against spend
apiRouter.post("/coupons/validate", async (req, res, next) => {
  try {
    const { code, subtotal } = val.ValidateCouponSchema.parse(req.body);
    const coupon = await couponRepo.findByCode(code);
    
    if (!coupon) {
      return res.status(400).json({ error: "Invalid coupon code." });
    }
    if (!coupon.isActive) {
      return res.status(400).json({ error: "Coupon is no longer active." });
    }
    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return res.status(400).json({ error: `Min spend of ₹${coupon.minSpend} required for this coupon.` });
    }

    const discountAmount = Math.floor((subtotal * coupon.discountPercentage) / 100);
    res.json({
      valid: true,
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      discountAmount,
      description: coupon.description,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map(e => e.message).join(", ") });
    }
    next(error);
  }
});

// Get all coupons (Admin only)
apiRouter.get("/coupons", requireAuth, requireRole(["admin"]), async (_req: AuthenticatedRequest, res, next) => {
  try {
    const list = await couponRepo.getAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
});

// Create coupon (Admin only)
apiRouter.post("/coupons", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = val.CreateCouponSchema.parse(req.body);
    const coupon = await couponRepo.createCoupon(data);
    res.json({ success: true, coupon });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map(e => e.message).join(", ") });
    }
    next(error);
  }
});

// ==========================================
// 6. SECURE STORAGE / MEDIA UPLOAD
// ==========================================
apiRouter.post("/upload", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { base64Data, filename } = val.UploadImageSchema.parse(req.body);
    const publicUrl = await storageService.uploadImage(base64Data, filename);
    res.json({ success: true, url: publicUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map(e => e.message).join(", ") });
    }
    next(error);
  }
});

// ==========================================
// 7. DYNAMIC BLOGS & FAQS (Phase 5 Placeholder Cleanup)
// ==========================================
apiRouter.get("/blogs", (_req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    // In production, return empty list (or dynamically fetch from DB/CMS)
    res.json([]);
  } else {
    // In development mode, return seeded articles
    res.json(BLOG_POSTS);
  }
});

apiRouter.get("/faqs", (_req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    // In production, return empty list (or dynamically fetch from DB/CMS)
    res.json([]);
  } else {
    // In development mode, return seeded FAQs
    const defaultFaqs = [
      { q: "What defines slow artisan fashion?", a: "Slow fashion focuses on small-batch manufacturing, paying weavers fair salaries, selecting raw bio-degradable flax cotton, and utilizing hand-carved block prints rather than high-carbon industrial digital printing." },
      { q: "How should I care for block printed indigo?", a: "Natural organic indigo bleed naturally during early washes. We highly recommend washing separately in gentle cold water, drying in shade inside-out, and using warm irons." },
      { q: "Where are The Bluberd garments stitched?", a: "Our fabrics are woven in Varanasi and Lucknow, and subsequently tailored with reinforced double stitching in our boutique atelier located in Bhopal, Madhya Pradesh." },
      { q: "How long does standard delivery take?", a: "We dispatch orders within 24 hours. Transit take 3 to 5 business days inside major metropolitan cities of India. Shipping on orders over ₹999 is completely free." },
      { q: "Do you offer returns and size exchanges?", a: "Yes, we accept easy returns and size exchanges within 15 days of delivery, provided the tags and original packaging are kept fully intact." }
    ];
    res.json(defaultFaqs);
  }
});
