import { db } from "../index.ts";
import { coupons } from "../schema.ts";
import { eq } from "drizzle-orm";

export class CouponRepository {
  async findByCode(code: string) {
    try {
      const result = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase()));
      return result[0] || null;
    } catch (error) {
      console.error(`[CouponRepository] Error in findByCode(${code}):`, error);
      throw new Error("Database fetch coupon failed.", { cause: error });
    }
  }

  async incrementUsage(code: string) {
    try {
      const coupon = await this.findByCode(code);
      if (coupon) {
        await db.update(coupons)
          .set({ usageCount: coupon.usageCount + 1 })
          .where(eq(coupons.code, coupon.code));
      }
    } catch (error) {
      console.error(`[CouponRepository] Error in incrementUsage(${code}):`, error);
      throw new Error("Database update coupon usage failed.", { cause: error });
    }
  }

  async createCoupon(coupon: { code: string; discountPercentage: number; minSpend?: number; description?: string }) {
    try {
      const result = await db.insert(coupons)
        .values({
          code: coupon.code.toUpperCase(),
          discountPercentage: coupon.discountPercentage,
          minSpend: coupon.minSpend,
          description: coupon.description,
          usageCount: 0,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: coupons.code,
          set: {
            discountPercentage: coupon.discountPercentage,
            minSpend: coupon.minSpend,
            description: coupon.description,
          }
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error("[CouponRepository] Error in createCoupon:", error);
      throw new Error("Database create coupon failed.", { cause: error });
    }
  }

  async getAll() {
    try {
      return await db.select().from(coupons);
    } catch (error) {
      console.error("[CouponRepository] Error in getAll:", error);
      throw new Error("Database fetch coupons failed.", { cause: error });
    }
  }
}
