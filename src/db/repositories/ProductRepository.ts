import { db } from "../index.ts";
import { products, inventory } from "../schema.ts";
import { eq, and, like, or } from "drizzle-orm";

export class ProductRepository {
  async findAll(filters?: { category?: string; subcategory?: string; search?: string }) {
    try {
      let query = db.select().from(products);
      
      const conditions = [];
      if (filters?.category) {
        conditions.push(eq(products.category, filters.category));
      }
      if (filters?.subcategory) {
        conditions.push(eq(products.subcategory, filters.subcategory));
      }
      if (filters?.search) {
        conditions.push(
          or(
            like(products.name, `%${filters.search}%`),
            like(products.brand, `%${filters.search}%`),
            like(products.description, `%${filters.search}%`)
          )
        );
      }

      if (conditions.length > 0) {
        // Apply filter condition
        // In Drizzle, we can combine them using and() helper
        const result = await db.select().from(products).where(and(...conditions));
        return result;
      }

      return await query;
    } catch (error) {
      console.error("[ProductRepository] Error in findAll:", error);
      throw new Error("Database fetch products failed.", { cause: error });
    }
  }

  async findById(id: string) {
    try {
      const result = await db.select().from(products).where(eq(products.id, id));
      return result[0] || null;
    } catch (error) {
      console.error(`[ProductRepository] Error in findById(${id}):`, error);
      throw new Error("Database fetch product by ID failed.", { cause: error });
    }
  }

  async getInventory(productId: string) {
    try {
      return await db.select().from(inventory).where(eq(inventory.productId, productId));
    } catch (error) {
      console.error(`[ProductRepository] Error in getInventory(${productId}):`, error);
      throw new Error("Database fetch product inventory failed.", { cause: error });
    }
  }

  async getSpecificStock(productId: string, size: string, color: string) {
    try {
      const result = await db.select()
        .from(inventory)
        .where(
          and(
            eq(inventory.productId, productId),
            eq(inventory.size, size),
            eq(inventory.color, color)
          )
        );
      return result[0] || null;
    } catch (error) {
      console.error("[ProductRepository] Error in getSpecificStock:", error);
      throw new Error("Database fetch stock failed.", { cause: error });
    }
  }

  async updateStock(productId: string, size: string, color: string, quantityDelta: number) {
    try {
      // Find current stock
      const stock = await this.getSpecificStock(productId, size, color);
      if (!stock) {
        // Create new entry
        await db.insert(inventory).values({
          productId,
          size,
          color,
          quantity: Math.max(0, quantityDelta),
        });
        return;
      }

      const newQty = Math.max(0, stock.quantity + quantityDelta);
      await db.update(inventory)
        .set({ quantity: newQty })
        .where(eq(inventory.id, stock.id));
    } catch (error) {
      console.error("[ProductRepository] Error in updateStock:", error);
      throw new Error("Database update stock failed.", { cause: error });
    }
  }

  async upsertProduct(prod: any) {
    try {
      const result = await db.insert(products)
        .values({
          id: prod.id,
          name: prod.name,
          brand: prod.brand,
          price: prod.price,
          mrp: prod.mrp,
          badge: prod.badge,
          category: prod.category,
          subcategory: prod.subcategory,
          images: prod.images,
          colors: prod.colors,
          sizes: prod.sizes,
          description: prod.description,
          fabricCare: prod.fabricCare,
          shippingReturns: prod.shippingReturns,
        })
        .onConflictDoUpdate({
          target: products.id,
          set: {
            name: prod.name,
            brand: prod.brand,
            price: prod.price,
            mrp: prod.mrp,
            badge: prod.badge,
            category: prod.category,
            subcategory: prod.subcategory,
            images: prod.images,
            colors: prod.colors,
            sizes: prod.sizes,
            description: prod.description,
            fabricCare: prod.fabricCare,
            shippingReturns: prod.shippingReturns,
          },
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error("[ProductRepository] Error in upsertProduct:", error);
      throw new Error("Database upsert product failed.", { cause: error });
    }
  }

  async deleteProduct(id: string) {
    try {
      await db.delete(products).where(eq(products.id, id));
    } catch (error) {
      console.error(`[ProductRepository] Error in deleteProduct(${id}):`, error);
      throw new Error("Database delete product failed.", { cause: error });
    }
  }
}
