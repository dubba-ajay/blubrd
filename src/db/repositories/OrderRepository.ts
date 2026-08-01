import { db } from "../index.ts";
import { orders, orderItems, inventory } from "../schema.ts";
import { eq, desc } from "drizzle-orm";

export class OrderRepository {
  async findById(orderId: string) {
    try {
      const orderResult = await db.select().from(orders).where(eq(orders.id, orderId));
      if (orderResult.length === 0) return null;

      const itemsResult = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

      return {
        ...orderResult[0],
        items: itemsResult,
      };
    } catch (error) {
      console.error(`[OrderRepository] Error in findById(${orderId}):`, error);
      throw new Error("Database fetch order failed.", { cause: error });
    }
  }

  async findByUserId(userId: number) {
    try {
      const userOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
      const result = [];
      for (const order of userOrders) {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        result.push({
          ...order,
          items,
        });
      }
      return result;
    } catch (error) {
      console.error(`[OrderRepository] Error in findByUserId(${userId}):`, error);
      throw new Error("Database fetch user orders failed.", { cause: error });
    }
  }

  async findAll() {
    try {
      const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      const result = [];
      for (const order of allOrders) {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        result.push({
          ...order,
          items,
        });
      }
      return result;
    } catch (error) {
      console.error("[OrderRepository] Error in findAll:", error);
      throw new Error("Database fetch all orders failed.", { cause: error });
    }
  }

  // Create order with complete database transaction
  async createOrder(orderData: {
    id: string;
    userId: number | null;
    customerName: string;
    email: string;
    phone?: string;
    address: string;
    total: number;
    paymentMethod: string;
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      size: string;
      color: string;
      image: string;
    }>;
  }) {
    try {
      // Use transaction to ensure order and items creation + inventory reduction is atomic!
      const finalOrder = await db.transaction(async (tx) => {
        // 1. Create the order
        const [newOrder] = await tx.insert(orders)
          .values({
            id: orderData.id,
            userId: orderData.userId,
            customerName: orderData.customerName,
            email: orderData.email,
            phone: orderData.phone,
            address: orderData.address,
            total: orderData.total,
            status: "Pending",
            paymentMethod: orderData.paymentMethod,
          })
          .returning();

        // 2. Insert items and decrement stock
        for (const item of orderData.items) {
          await tx.insert(orderItems).values({
            orderId: newOrder.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image,
          });

          // Verify stock exists and decrement it
          const [stock] = await tx.select()
            .from(inventory)
            .where(
              and(
                eq(inventory.productId, item.productId),
                eq(inventory.size, item.size),
                eq(inventory.color, item.color)
              )
            );

          if (stock) {
            if (stock.quantity < item.quantity) {
              throw new Error(`Insufficient stock for product ${item.name} (${item.size} - ${item.color})`);
            }
            const updatedQty = stock.quantity - item.quantity;
            await tx.update(inventory)
              .set({ quantity: updatedQty })
              .where(eq(inventory.id, stock.id));
          }
        }

        return newOrder;
      });

      return finalOrder;
    } catch (error) {
      console.error("[OrderRepository] Transaction failed in createOrder:", error);
      throw new Error(error instanceof Error ? error.message : "Database order transaction failed.", { cause: error });
    }
  }

  async updateStatus(orderId: string, status: string, trackingId?: string, estimatedDelivery?: string) {
    try {
      const setValues: any = { status };
      if (trackingId) setValues.trackingId = trackingId;
      if (estimatedDelivery) setValues.estimatedDelivery = estimatedDelivery;

      const result = await db.update(orders)
        .set(setValues)
        .where(eq(orders.id, orderId))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error(`[OrderRepository] Error updating status for ${orderId}:`, error);
      throw new Error("Database update order status failed.", { cause: error });
    }
  }

  async refundOrder(orderId: string, reason: string) {
    try {
      const result = await db.update(orders)
        .set({ status: "Refunded", returnReason: reason })
        .where(eq(orders.id, orderId))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error(`[OrderRepository] Error refunding order ${orderId}:`, error);
      throw new Error("Database refund order failed.", { cause: error });
    }
  }
}

// Helper function to combine multiple conditions for Drizzle queries (like 'and')
function and(...conditions: any[]) {
  const { and } = require("drizzle-orm");
  return and(...conditions);
}
