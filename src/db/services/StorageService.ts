import { Storage } from "@google-cloud/storage";
import fs from "fs";
import path from "path";

export class StorageService {
  private storage: Storage | null = null;
  private bucketName: string | null = null;

  constructor() {
    this.bucketName = process.env.GCS_BUCKET_NAME || null;
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    // Only initialize Google Cloud Storage if bucket name is configured
    if (this.bucketName) {
      try {
        this.storage = credentialsPath ? new Storage() : new Storage();
        console.log(`[StorageService] Google Cloud Storage initialized with bucket: ${this.bucketName}`);
      } catch (err) {
        console.error("[StorageService] Failed to initialize Google Cloud Storage:", err);
      }
    } else {
      console.log("[StorageService] GCS_BUCKET_NAME not provided. Falling back to secure local static file storage.");
    }
  }

  async uploadImage(base64Data: string, filename: string): Promise<string> {
    try {
      // 1. Clean up base64 header if present
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      if (matches && matches.length === 3) {
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(base64Data, "base64");
      }

      const uniqueFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      // 2. Production flow: Upload to real Google Cloud Storage bucket
      if (this.storage && this.bucketName) {
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(uniqueFilename);

        await file.save(buffer, {
          metadata: { contentType: "image/jpeg" },
          resumable: false,
        });

        // Set file public in GCS if required or return public access URL
        return `https://storage.googleapis.com/${this.bucketName}/${uniqueFilename}`;
      }

      // 3. Fallback flow: Save locally in a public directory for preview/development
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const localPath = path.join(uploadDir, uniqueFilename);
      fs.writeFileSync(localPath, buffer);

      console.log(`[StorageService] Image uploaded locally to: ${localPath}`);
      return `/uploads/${uniqueFilename}`;
    } catch (error) {
      console.error("[StorageService] Error uploading image:", error);
      throw new Error("Failed to upload image. Storage service failure.", { cause: error });
    }
  }
}
