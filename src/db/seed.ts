import { db } from "./index.ts";
import { products, inventory, coupons } from "./schema.ts";
import { PRODUCTS } from "../data/products.ts";

export async function seedDatabase() {
  try {
    console.log("[Seeder] Starting database seeding...");

    // 1. Seed Products
    const dbProducts = await db.select().from(products);
    if (dbProducts.length === 0) {
      console.log(`[Seeder] Inserting ${PRODUCTS.length} products...`);
      for (const prod of PRODUCTS) {
        // Map types correctly to DB
        await db.insert(products).values({
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
        }).onConflictDoNothing();

        // Seed inventory for this product
        // For each combination of colors and sizes, add 50 units stock
        console.log(`[Seeder] Creating inventory for product ${prod.id}...`);
        for (const color of prod.colors) {
          for (const size of prod.sizes) {
            await db.insert(inventory).values({
              productId: prod.id,
              size: size,
              color: color.name,
              quantity: 50, // default stock of 50
            }).onConflictDoNothing();
          }
        }
      }
      console.log("[Seeder] Products and inventory seeded successfully.");
    } else {
      console.log("[Seeder] Database already contains products. Skipping product seeding.");
    }

    // 2. Seed Default Coupons
    const dbCoupons = await db.select().from(coupons);
    if (dbCoupons.length === 0) {
      console.log("[Seeder] Seeding default coupons...");
      const defaultCoupons = [
        { code: "FESTIVE20", discountPercentage: 20, minSpend: 1500, description: "Get 20% off on purchase of ₹1500 or more" },
        { code: "HANDLOOM10", discountPercentage: 10, minSpend: 500, description: "Get 10% off on your artisan purchase" },
        { code: "WELCOME50", discountPercentage: 50, minSpend: 3000, description: "Mega 50% discount on orders of ₹3000+" }
      ];

      for (const coupon of defaultCoupons) {
        await db.insert(coupons).values({
          code: coupon.code,
          discountPercentage: coupon.discountPercentage,
          minSpend: coupon.minSpend,
          description: coupon.description,
          usageCount: 0,
          isActive: true,
        }).onConflictDoNothing();
      }
      console.log("[Seeder] Coupons seeded successfully.");
    }

    console.log("[Seeder] Database seeding flow finished.");
  } catch (error) {
    console.error("[Seeder] Error during database seeding:", error);
  }
}
