import crypto from "crypto";
import { OrderRepository } from "../repositories/OrderRepository.ts";
import { ProductRepository } from "../repositories/ProductRepository.ts";
import { CouponRepository } from "../repositories/CouponRepository.ts";
import { CartRepository } from "../repositories/CartRepository.ts";

export class OrderService {
  private orderRepo = new OrderRepository();
  private productRepo = new ProductRepository();
  private couponRepo = new CouponRepository();
  private cartRepo = new CartRepository();

  // 1. Server-side order amount verification
  async verifyAndCreatePendingOrder(orderInput: {
    userId: number | null;
    customerName: string;
    email: string;
    phone?: string;
    address: string;
    items: Array<{
      productId: string;
      quantity: number;
      size: string;
      color: string;
    }>;
    couponCode?: string;
    claimedTotal: number; // Client-submitted total to verify
  }) {
    console.log(`[OrderService] Verifying order for customer ${orderInput.customerName}...`);
    
    let dbSubtotal = 0;
    const verifiedItems = [];

    // Fetch products from database and calculate subtotal
    for (const item of orderInput.items) {
      const dbProd = await this.productRepo.findById(item.productId);
      if (!dbProd) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Check stock availability
      const stock = await this.productRepo.getSpecificStock(item.productId, item.size, item.color);
      if (!stock || stock.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${dbProd.name} (${item.size} - ${item.color}). Only ${stock?.quantity || 0} left.`);
      }

      const itemTotal = dbProd.price * item.quantity;
      dbSubtotal += itemTotal;

      verifiedItems.push({
        productId: item.productId,
        name: dbProd.name,
        price: dbProd.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: Array.isArray(dbProd.images) && dbProd.images.length > 0 ? (dbProd.images[0] as string) : "",
      });
    }

    // Process coupon if provided
    let discountAmount = 0;
    let verifiedCouponCode = null;

    if (orderInput.couponCode) {
      const coupon = await this.couponRepo.findByCode(orderInput.couponCode);
      if (coupon && coupon.isActive) {
        // Validate min spend
        if (!coupon.minSpend || dbSubtotal >= coupon.minSpend) {
          discountAmount = Math.floor((dbSubtotal * coupon.discountPercentage) / 100);
          verifiedCouponCode = coupon.code;
        }
      }
    }

    const calculatedTotal = Math.max(0, dbSubtotal - discountAmount);

    // Verify claimed total to prevent client-side price manipulation
    if (Math.abs(calculatedTotal - orderInput.claimedTotal) > 5) { // Allow ₹5 margin for rounding variations
      throw new Error(`Price tampering detected! Calculated order value is ₹${calculatedTotal}, but client claimed ₹${orderInput.claimedTotal}.`);
    }

    // Generate unique Gateway / Order ID
    const orderId = `ODR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}-IN`;

    console.log(`[OrderService] Order verified successfully. Order ID: ${orderId}, Total: ₹${calculatedTotal}`);

    return {
      orderId,
      subtotal: dbSubtotal,
      discount: discountAmount,
      total: calculatedTotal,
      verifiedItems,
      couponCode: verifiedCouponCode,
    };
  }

  // 2. Complete order transaction on successful payment
  async completeOrder(paymentData: {
    orderId: string;
    userId: number | null;
    customerName: string;
    email: string;
    phone?: string;
    address: string;
    total: number;
    paymentMethod: string;
    items: any[];
    couponCode?: string;
    gatewayPaymentId: string;
    gatewaySignature?: string;
  }) {
    console.log(`[OrderService] Finalizing order booking for ${paymentData.orderId}...`);

    // Verify Razorpay Payment Signature if keys are set
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret && paymentData.gatewaySignature) {
      const text = paymentData.orderId + "|" + paymentData.gatewayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(text)
        .digest("hex");

      if (expectedSignature !== paymentData.gatewaySignature) {
        throw new Error("Razorpay Signature verification failed. Tampering suspected!");
      }
      console.log(`[OrderService] Razorpay signature verified successfully.`);
    } else {
      console.log(`[OrderService] Razorpay key secret missing. Signature verification bypassed for local test/preview.`);
    }

    // Create the order using atomic database transaction (including stock reduction!)
    const result = await this.orderRepo.createOrder({
      id: paymentData.orderId,
      userId: paymentData.userId,
      customerName: paymentData.customerName,
      email: paymentData.email,
      phone: paymentData.phone,
      address: paymentData.address,
      total: paymentData.total,
      paymentMethod: paymentData.paymentMethod,
      items: paymentData.items,
    });

    // Update coupon usage if applicable
    if (paymentData.couponCode) {
      await this.couponRepo.incrementUsage(paymentData.couponCode);
    }

    // Clear user cart if authenticated
    if (paymentData.userId) {
      await this.cartRepo.clearCart(paymentData.userId);
    }

    // Generate logistics tracking
    const trackingId = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}-DEL`;
    const waybill = `WBY-${Math.floor(40000000 + Math.random() * 50000000)}`;
    const estimatedDelivery = new Date(Date.now() + 3600000 * 24 * 4).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Update order status to Processing and assign logistics
    await this.orderRepo.updateStatus(result.id, "Processing", trackingId, estimatedDelivery);

    return {
      success: true,
      order: {
        ...result,
        status: "Processing",
        trackingId,
        estimatedDelivery,
      },
      shipping: {
        carrier: "Delhivery Air Express",
        waybill,
        trackingId,
        estimatedDelivery,
      }
    };
  }
}
