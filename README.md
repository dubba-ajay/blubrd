# THE BLUBERD — Premium E-Commerce Platform

THE BLUBERD is a full-stack e-commerce application engineered for luxury apparel and artisan fashion. Built with React, TypeScript, Express, Tailwind CSS, Drizzle ORM, and PostgreSQL, the platform provides complete end-to-end capabilities for online shopping, customer account management, payment processing, inventory tracking, and fulfillment logistics.

---

## Key Features

- **Storefront & Catalog**: Product listings, dynamic filtering, artisan collection showcases, instant product drawer previews, and high-resolution galleries.
- **Shopping & Checkout**: Responsive cart state, coupon application, pincode serviceability checks, address validation, and seamless guest/user checkout flow.
- **Payment Processing**: Integrated Razorpay payment gateway with HMAC SHA-256 server-side signature verification and PhonePe payload support.
- **Customer Account Management**: Phone OTP & Email authentication via Firebase, order tracking, address book, saved favorites, and patron history.
- **Admin & Operations Dashboard**: Real-time sales analytics, order fulfillment state updates, inventory control, coupon creation, and customer management.
- **Logistics & Shipping**: Integrations with Shiprocket and Delhivery for real-time tracking updates and automated label generation.
- **Production Architecture**: Express API backend, Drizzle ORM with PostgreSQL database schema, JWT auth tokens, and Google Cloud Storage media uploads.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Express.js, TypeScript, ESBuild, Node.js
- **Database**: PostgreSQL with Drizzle ORM & Drizzle Kit
- **Authentication**: Firebase Auth (Phone OTP / Email) + Server-side JWT Tokens
- **Payment Gateways**: Razorpay, PhonePe
- **Shipping Logistics**: Shiprocket, Delhivery
- **Storage**: Google Cloud Storage (GCS)

---

## Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```ini
# ENVIRONMENT SETTINGS
NODE_ENV="production"
PORT=3000
APP_URL="https://thebluberd.com"

# CLOUD SQL & DATABASE CONFIGURATION
SQL_HOST="localhost"
SQL_USER="postgres"
SQL_PASSWORD="secure_db_password"
SQL_DB_NAME="bluberd"
SQL_ADMIN_USER="postgres"
SQL_ADMIN_PASSWORD="secure_db_admin_password"

# PRODUCTION SECURE PAYMENTS
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="secret_xxxxxxxxxxxx"
PHONEPE_MERCHANT_ID="MERCHANT_ID_12345"
PHONEPE_SALT_KEY="salt_key_xxxxxxxxxxxxx"

# LOGISTICS & SHIPPING CARRIERS
SHIPROCKET_EMAIL="logistics@thebluberd.com"
SHIPROCKET_PASSWORD="password_xxxxxxx"
DELHIVERY_API_TOKEN="token_xxxxxxxxxxxx"

# SECURE JWT SESSION KEYS
JWT_SECRET="bluberd_access_secret_key_987654321"
JWT_REFRESH_SECRET="bluberd_refresh_secret_key_123456789"
SESSION_SECRET_KEY="bluberd_production_session_signing_secret_key"

# GOOGLE CLOUD STORAGE
GCS_BUCKET_NAME="bluberd-production-media-assets"
```

---

## Local Development & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

3. **Database Schema & Migrations**:
   ```bash
   npx drizzle-kit push:pg
   ```

4. **Linting & Code Verification**:
   ```bash
   npm run lint
   ```

---

## Production Build & Deployment

1. **Build Project**:
   ```bash
   npm run build
   ```
   This compiles the frontend using Vite and bundles the Express server using ESBuild into `dist/server.cjs`.

2. **Start Production Server**:
   ```bash
   npm run start
   ```

3. **Container Deployment (Docker)**:
   A multi-stage Dockerfile is provided for Cloud Run or Kubernetes container deployment:
   ```bash
   docker build -t the-bluberd:latest .
   docker run -p 3000:3000 --env-file .env the-bluberd:latest
   ```

For detailed infrastructure, domain configuration, and production topologies, see [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md).
