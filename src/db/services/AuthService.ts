import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository.ts";

const JWT_SECRET = process.env.JWT_SECRET || "bluberd_access_secret_key_987654321";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "bluberd_refresh_secret_key_123456789";

const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // 7 days

export interface JWTPayload {
  id: number;
  uid: string;
  email: string;
  role: string;
  name: string;
}

export class AuthService {
  private userRepo = new UserRepository();

  generateAccessToken(user: JWTPayload): string {
    return jwt.sign(
      { id: user.id, uid: user.uid, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  generateRefreshToken(user: JWTPayload): string {
    return jwt.sign(
      { id: user.id, uid: user.uid },
      JWT_REFRESH_SECRET,
      { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` }
    );
  }

  async loginOrRegister(firebaseUser: { uid: string; email: string; name: string; phone?: string; role?: string }) {
    // 1. Get or create user in DB
    const user = await this.userRepo.upsertUser(firebaseUser);

    const payload: JWTPayload = {
      id: user.id,
      uid: user.uid,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    // 2. Generate tokens
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // 3. Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    await this.userRepo.createRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshSession(token: string) {
    try {
      // 1. Find token in DB
      const dbToken = await this.userRepo.findRefreshToken(token);
      if (!dbToken) {
        throw new Error("Invalid or revoked refresh token.");
      }

      // Check if expired
      if (new Date() > dbToken.expiresAt) {
        await this.userRepo.deleteRefreshToken(token);
        throw new Error("Refresh token expired.");
      }

      // 2. Verify JWT signature
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: number; uid: string };
      
      // 3. Get user details
      const user = await this.userRepo.findById(decoded.id);
      if (!user) {
        throw new Error("User associated with token not found.");
      }

      const payload: JWTPayload = {
        id: user.id,
        uid: user.uid,
        email: user.email,
        role: user.role,
        name: user.name,
      };

      // 4. Generate new access token
      const accessToken = this.generateAccessToken(payload);

      return {
        accessToken,
        user,
      };
    } catch (error) {
      console.error("[AuthService] Refresh session failed:", error);
      throw new Error(error instanceof Error ? error.message : "Authentication session refresh failed.");
    }
  }

  async logout(token: string) {
    try {
      await this.userRepo.deleteRefreshToken(token);
    } catch (error) {
      console.error("[AuthService] Logout failed:", error);
      throw new Error("Logout operation failed.");
    }
  }

  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error("Access token is invalid or expired.");
    }
  }
}
