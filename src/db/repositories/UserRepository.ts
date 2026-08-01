import { db } from "../index.ts";
import { users, refreshTokens } from "../schema.ts";
import { eq } from "drizzle-orm";

export class UserRepository {
  async findById(id: number) {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0] || null;
    } catch (error) {
      console.error(`[UserRepository] Error in findById(${id}):`, error);
      throw new Error("Database fetch user failed.", { cause: error });
    }
  }

  async findByUid(uid: string) {
    try {
      const result = await db.select().from(users).where(eq(users.uid, uid));
      return result[0] || null;
    } catch (error) {
      console.error(`[UserRepository] Error in findByUid(${uid}):`, error);
      throw new Error("Database fetch user by UID failed.", { cause: error });
    }
  }

  async findByEmail(email: string) {
    try {
      const result = await db.select().from(users).where(eq(users.email, email));
      return result[0] || null;
    } catch (error) {
      console.error(`[UserRepository] Error in findByEmail(${email}):`, error);
      throw new Error("Database fetch user by email failed.", { cause: error });
    }
  }

  async upsertUser(user: { uid: string; email: string; name: string; phone?: string; role?: string }) {
    try {
      const result = await db.insert(users)
        .values({
          uid: user.uid,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role || "customer",
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            email: user.email,
            name: user.name,
            phone: user.phone || null,
          },
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error("[UserRepository] Error in upsertUser:", error);
      throw new Error("Database upsert user failed.", { cause: error });
    }
  }

  async createRefreshToken(userId: number, token: string, expiresAt: Date) {
    try {
      const result = await db.insert(refreshTokens)
        .values({
          userId,
          token,
          expiresAt,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error("[UserRepository] Error in createRefreshToken:", error);
      throw new Error("Database save refresh token failed.", { cause: error });
    }
  }

  async findRefreshToken(token: string) {
    try {
      const result = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
      return result[0] || null;
    } catch (error) {
      console.error("[UserRepository] Error in findRefreshToken:", error);
      throw new Error("Database fetch refresh token failed.", { cause: error });
    }
  }

  async deleteRefreshToken(token: string) {
    try {
      await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    } catch (error) {
      console.error("[UserRepository] Error in deleteRefreshToken:", error);
      throw new Error("Database delete refresh token failed.", { cause: error });
    }
  }
}
