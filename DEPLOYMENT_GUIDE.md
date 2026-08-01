# The Bluberd Staging & Production Deployment Guide
This document serves as the authoritative deployment blueprint for **The Bluberd**, a full-stack premium organic e-commerce system. It covers configuration schemas, security parameters, infrastructure topologies, and a comprehensive pre-flight checklist.

---

## 1. Environment Topology & Separation

```
  [ Users / Patrons ]
          │
          ▼
   [ DNS: Cloudflare ] ──( HTTPS, WAF, HSTS, Rate Limiting )
          │
          ▼
   [ Google Cloud Run Ingress ]
          │
          ├─────────────────────────┐
          ▼                         ▼
   [ Docker Container ]     [ GCS Bucket (Media assets) ]
    (Express + Vite SPA)
          │
          ├─────────────────────────┐
          ▼                         ▼
   [ Cloud SQL (PostgreSQL) ]  [ Firebase Auth / Identity ]
```

To maintain isolation and guarantee system integrity, we enforce strict **Environment Separation**:

| Parameter | Local Development | Staging (Pre-Release) | Production (Live) |
| :--- | :--- | :--- | :--- |
| **API Domain** | `http://localhost:3000` | `https://staging-api.thebluberd.com` | `https://api.thebluberd.com` |
| **Frontend Domain**| `http://localhost:3000` | `https://staging.thebluberd.com` | `https://thebluberd.com` |
| **Database** | Local PostgreSQL Container | Cloud SQL (PostgreSQL) - Dev/Staging | Cloud SQL (PostgreSQL) - HA (Highly Available) |
| **Auth Tenant** | Dev Firebase project | Staging Firebase project tenant | Production Firebase project |
| **Payment Gateway**| Razorpay Sandbox / Test Keys | Razorpay Sandbox | Razorpay Live Mode |
| **Asset Storage** | Secure local static `/uploads` | Google Cloud Storage (Staging Bucket) | Google Cloud Storage (Production Bucket) |

---

## 2. Production Environment Variables (`.env`)

A `.env` file must be generated for each environment. Sensitive credentials must **never** be committed to source control. They should be injected securely via Google Cloud Secret Manager or Cloud Run Environment variables.

```ini
# ENVIRONMENT SETTINGS
NODE_ENV="production"
PORT=3000
APP_URL="https://thebluberd.com"

# DATABASE (CLOUD SQL POSTGRESQL)
SQL_HOST="/cloudsql/YOUR_PROJECT_ID:YOUR_REGION:YOUR_INSTANCE_ID" # Cloud Run unix socket or private IP
SQL_USER="bluberd_app"
SQL_PASSWORD="DECRYPTED_DATABASE_SECURE_PASSWORD"
SQL_DB_NAME="bluberd_prod"
SQL_ADMIN_USER="postgres"
SQL_ADMIN_PASSWORD="DECRYPTED_DATABASE_ADMIN_PASSWORD"

# AUTHENTICATION & IDENTITY (JWT SHA-256 KEYS)
JWT_SECRET="JWT_SIGNING_SECRET_STRENGTH_32_CHARACTERS"
JWT_REFRESH_SECRET="JWT_REFRESH_SECRET_STRENGTH_32_CHARACTERS"
SESSION_SECRET_KEY="SESSION_COOKIE_SIGNING_KEY_32_CHARACTERS"

# SECURE GATEWAYS & PAYMENT SCHEMES (Razorpay Live/Sandbox)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="secret_xxxxxxxxxxxx"
PHONEPE_MERCHANT_ID="MERCHANT_ID_12345"
PHONEPE_SALT_KEY="salt_key_xxxxxxxxxxxxx"

# LOGISTICS, SHIPMENTS & DELIVERIES (Shiprocket & Delhivery)
SHIPROCKET_EMAIL="logistics@thebluberd.com"
SHIPROCKET_PASSWORD="password_xxxxxxx"
DELHIVERY_API_TOKEN="token_xxxxxxxxxxxx"

# GOOGLE CLOUD STORAGE BUCKET
GCS_BUCKET_NAME="bluberd-production-media-assets"
```

---

## 3. Database Engine: Cloud SQL Configuration

Our backend leverages **PostgreSQL** via **Drizzle ORM**. Follow these configuration procedures to transition to a production-grade Cloud SQL service:

1. **Instance Provisioning**:
   - Provision a PostgreSQL Instance in Cloud SQL (Recommended: v15+ Enterprise Edition).
   - Set up **High Availability (HA)** with automatic failover across different zones (Primary + Standby replica).
2. **Connectivity Design (Private Access)**:
   - Disable Public IP. Enable **Private IP** within your Virtual Private Cloud (VPC) to restrict database traffic from the public internet.
   - Configure a **VPC Access Connector** in Cloud Run to route outbound traffic directly into your private network.
3. **Database User Isolation**:
   - Set up separate database accounts:
     - `postgres`: Superuser account used strictly for migrations and structural updates.
     - `bluberd_app`: Low-privilege application account with `SELECT`, `INSERT`, `UPDATE`, and `DELETE` access only, to prevent database exploitation.
4. **Automated Schema Management**:
   - Run structural database migrations in your CI/CD pipeline prior to traffic cutover:
     ```bash
     npm run build
     npx drizzle-kit push:pg
     ```

---

## 4. Identity Engine: Firebase Configuration

Production environments must employ isolated Firebase Projects to separate user scopes, credentials, and authorization limits:

1. **Config Separation**:
   - Save the production Client Config inside `/firebase-config.json` at deployment time.
   - Restrict API Key permissions in the Google Cloud Console to only allow requests from your verified domains (e.g., `https://thebluberd.com`).
2. **Security Policies**:
   - Configure **Firestore Security Rules** to allow document CRUD operations strictly through server-side APIs or validated Firebase tokens.
   - Disable unneeded sign-in providers. Enforce Phone OTP and Email verification on production projects.

---

## 5. Media Assets Storage: Google Cloud Storage (GCS)

To scale file uploads and avoid server disk exhaustion, the application routes images to GCS buckets via `StorageService`:

1. **Bucket Configuration**:
   - Create a Google Cloud Storage Bucket: `bluberd-production-media-assets`.
   - Set the storage class to **Standard** and location to your primary deployment region (e.g., `asia-south1` or `us-central1`).
2. **Access Control**:
   - Disable **Public Access Prevention (PAP)** only if public media links are required. Otherwise, use signed URLs or a CDN proxy for image retrievals.
   - Add a custom IAM policy granting the `Storage Object Creator` and `Storage Object Viewer` roles to the Cloud Run service account.
3. **CORS Configuration**:
   - Apply a CORS policy allowing GET requests from your domains:
     ```json
     [
       {
         "origin": ["https://thebluberd.com", "https://staging.thebluberd.com"],
         "method": ["GET", "OPTIONS"],
         "responseHeader": ["Content-Type"],
         "maxAgeSeconds": 3600
       }
     ]
     ```

---

## 6. Payment Engine: Razorpay Sandbox & Live Schemes

Our full-stack payment module uses **Razorpay Signature HMAC SHA256 Verification** on the server to prevent fraud and transaction tampering.

1. **Sandbox (Test) Mode Validation**:
   - Use test credentials (`rzp_test_...`) during staging and development verification.
   - Simulate transactions with Razorpay's designated test cards, UPI IDs, and net banking portals.
2. **Transitioning to Live Mode**:
   - Replace API credentials with production keys (`rzp_live_...`).
   - Register the production Webhook URL on Razorpay Dashboard: `https://thebluberd.com/api/payments/webhook`.
   - Select the required webhook events: `order.paid`, `payment.failed`.
   - Store the secret webhook salt in your environment and verify signatures cryptographically using HMAC before processing webhooks on the backend.

---

## 7. Networking: Domains, SSL, HTTPS & HSTS

1. **Domain Settings (DNS Records)**:
   - Direct your primary domain to the Cloud Run service or Load Balancer:
     - **CNAME Record**: `www` pointing to Cloud Run Custom Domain hostname.
     - **A Record**: Root `@` pointing to Cloud Run IP list or Load Balancer IP.
2. **SSL/TLS & HTTPS**:
   - Cloud Run automatically provisions and renews managed Let's Encrypt certificates.
   - Require **TLS 1.3** as the minimum supported TLS version on your Load Balancer or Cloudflare setup.
3. **Strict Transport Security (HSTS)**:
   - The server has been configured to issue HSTS headers in all responses:
     ```http
     Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
     ```
   - This ensures modern browsers never attempt insecure HTTP handshakes.

---

## 8. Container Orchestration & Docker Optimization

Our custom multi-stage Docker configuration ensures lightweight container images and minimizes attack surfaces:

1. **Double-Stage Build Architecture**:
   - **Stage 1 (Builder)**: Compiles TypeScript assets, bundles frontend code using Vite, and creates the single-file server CommonJS executable (`dist/server.cjs`).
   - **Stage 2 (Runner)**: Pulls a minimal `node:20-alpine` footprint, installs zero devDependencies, copies compiled files, and switches to a non-privileged `nodejs` user.
2. **Container Optimization Rules**:
   - Keep the final image size below 150MB.
   - Exclude sensitive configuration files from the container by specifying them inside `.dockerignore`.
   - Restrict port bindings strictly to `3000`.

---

## 9. Performance & Health Checks

1. **Express & Native Node Health checks**:
   - Endpoint: `/api/health`
   - It outputs:
     - Application `uptime`
     - System memory consumption (RSS, Heap, V8 metrics)
     - Zone node details
2. **Orchestration Liveness & Readiness**:
   - Set up a container liveness probe pointing to `http://localhost:3000/api/health`.
   - Configure a container readiness probe to ensure the database pool is established before routing client traffic.

---

## 10. Production Logging & Telemetry

1. **Structured Log Outputs**:
   - All server activity is logged via the centralized `requestLogger` middleware.
   - Log format follows a clean JSON structure to ensure seamless integration with log aggregators (e.g., Google Cloud Logging / Winston).
2. **Centralized Log Storage**:
   - Avoid writing logs directly to files on the container filesystem (since container storage is ephemeral).
   - Pipe all outputs directly to `stdout` and `stderr` which are automatically collected and indexed by GCP Cloud Logging.

---

## 11. Error Monitoring & Exception Handling

Our Express framework intercepts all unhandled controller exceptions via the central error-handling middleware.

1. **Centralized Sentry Integration**:
   - Configure Sentry or an equivalent error reporting SDK in your production build:
     ```typescript
     import * as Sentry from "@sentry/node";
     
     if (process.env.NODE_ENV === "production") {
       Sentry.init({ dsn: process.env.SENTRY_DSN });
       app.use(Sentry.Handlers.requestHandler());
     }
     ```
2. **Exception Sanitization**:
   - Never leak internal system stacks or raw SQL/database error frames to clients.
   - Map fatal exceptions to clean client-facing codes (e.g., `INTERNAL_SERVER_ERROR`) while logging the full traceback internally for developer audits.

---

## 12. Backup Configuration & Disaster Recovery

To prevent data loss and support disaster recovery scenarios, define a rigid database backup policy:

1. **Automated Database Backups**:
   - Configure automated daily backups on the Cloud SQL instance.
   - Retain daily backups for a minimum of **30 days**.
2. **Point-In-Time Recovery (PITR)**:
   - Enable PostgreSQL **write-ahead logging (WAL)** and transaction log archiving.
   - This allows the system to recover to any precise millisecond within your retention window in the event of an outage or transactional anomaly.

---

## 13. Security Headers: Phase 7 Shield

Our active secure shields are fully optimized for production:

* **Strict-Transport-Security (HSTS)**: Restricts all communication to secure TLS channels.
* **X-Frame-Options (SAMEORIGIN)**: Inhibits Clickjacking vulnerabilities inside outer frames.
* **X-Content-Type-Options (nosniff)**: Eliminates MIME-sniffing exploits.
* **Referrer-Policy**: Controls the leakage of navigation URLs across endpoints.
* **Content-Security-Policy (CSP)**: Curated whitelist preventing script injections and XSS exploits.

---

## 14. Staging Deployment Checklist (Pre-Flight Runbook)

Verify that each item in this checklist is complete before cutting over live production or staging traffic:

### 🟩 Infrastructure Setup
- [ ] Staging and Production Cloud SQL PostgreSQL instances are provisioned and active.
- [ ] Private Service Connect (VPC Access) is established between Cloud Run and Cloud SQL.
- [ ] GCS bucket is active with proper CORS rules.
- [ ] Production and Staging Firebase Console projects are initialized and configured.

### 🟩 Environment Config & Secrets
- [ ] Variables defined in `.env.example` are populated in Google Cloud Secret Manager.
- [ ] No plaintext database, gateway, or API keys are present in code repositories.
- [ ] Host domain and callback mappings (`APP_URL`) are verified.

### 🟩 Build & Docker Integrity
- [ ] Docker image compiles successfully with multi-stage optimizations.
- [ ] Image vulnerability scans return zero High/Critical CVE alerts.
- [ ] Container binds to port `3000` and passes `/api/health` checks locally.

### 🟩 Security & Cryptography
- [ ] `Strict-Transport-Security` and complete CSP headers are verified on response headers.
- [ ] API Rate limiting is active and configured correctly.
- [ ] JWT keys use strong, cryptographically secure 256-bit keys.

### 🟩 Database Migrations & Seeds
- [ ] Drizzle migrations are pushed and active on the database target.
- [ ] Seed data (admin profiles, product list) is successfully indexed.

### 🟩 Payment & Logistics Go-Live
- [ ] Razorpay keys are transitioned to Live environment credentials.
- [ ] Logistics tokens for Shiprocket and Delhivery are active.
- [ ] Webhook validation endpoints are verified on both ends.

---

### End of Deployment Guide.
All structural changes, configuration updates, and Docker blueprints are completed.
