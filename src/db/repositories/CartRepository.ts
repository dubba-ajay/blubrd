import { db } from "../index.ts";
import { cartItems, products } from "../schema.ts";
import { eq, and } from "drizzle-orm";

export class CartRepository {
  async getByUserId(userId: number) {
    try {
      // Fetch cart items joined with products details
      const result = await db.select({
        id: cartItems.id,
        productId: cartItems.productId,
        size: cartItems.size,
        color: cartItems.color,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: {
          id: products.id,
          name: products.name,
          brand: products.brand,
          price: products.price,
          images: products.images,
        }
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

      return result;
    } catch (error) {
      console.error(`[CartRepository] Error in getByUserId(${userId}):`, error);
      throw new Error("Database fetch cart items failed.", { cause: error });
    }
  }

  async addItem(userId: number, productId: string, size: string, color: string, quantity: number) {
    try {
      // Check if item already exists in cart for this user
      const existing = await db.select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.userId, userId),
            eq(cartItems.productId, productId),
            eq(cartItems.size, size),
            eq(cartItems.color, color)
          )
        );

      if (existing.length > 0) {
        // Update quantity
        const newQty = existing[0].quantity + quantity;
        const result = await db.update(cartItems)
          .set({ quantity: newQty })
          .where(eq(cartItems.id, existing[0].id))
          .returning();
        return result[0];
      } else {
        // Insert new item
        const result = await db.insert(cartItems)
          .values({
            userId,
            productId,
            size,
            color,
            quantity,
          })
          .returning();
        return result[0];
      }
    } catch (error) {
      console.error("[CartRepository] Error in addItem:", error);
      throw new Error("Database add item to cart failed.", { cause: error });
    }
  }

  async updateQuantity(userId: number, id: number, quantity: number) {
    try {
      if (quantity <= 0) {
        await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
        return null;
      }
      const result = await db.update(cartItems)
        .set({ quantity })
        .where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error("[CartRepository] Error in updateQuantity:", error);
      throw new Error("Database update cart quantity failed.", { cause: error });
    }
  }

  async removeItem(userId: number, id: number) {
    try {
      await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
    } catch (error) {
      console.error("[CartRepository] Error in removeItem:", error);
      throw new Error("Database remove cart item failed.", { cause: error });
    }
  }

  async clearCart(userId: number) {
    try {
      await db.delete(cartItems).where(eq(cartItems.userId, userId));
    } catch (error) {
      console.error(`[CartRepository] Error in clearCart(${userId}):`, error);
      throw new Error("Database clear cart failed.", { cause: error });
    }
  }
}
