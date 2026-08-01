// Centralized system for consistent, production-ready form placeholders, hints, and input labels across the Rasolark application.

export const PLACEHOLDERS = {
  FORM: {
    FULL_NAME: "Enter your full name",
    EMAIL: "Enter your email address",
    PHONE: "Enter 10-digit mobile number",
    EMAIL_OR_PHONE: "Enter your email or 10-digit mobile number",
    PASSWORD: "Enter your password",
    CONFIRM_PASSWORD: "Confirm your password",
    STREET_ADDRESS: "Enter street address, building, apartment",
    CITY: "Enter city name",
    STATE: "Enter state",
    ZIP: "Enter 6-digit PIN code",
    PIN_CODE: "Enter 6-digit PIN code",
    CITY_STATE: "Enter city, state",
    COUNTRY: "Select country",
    OTP: "Enter 6-digit verification code",
    NEWSLETTER_EMAIL: "Enter your email address",
    REVIEWER_NAME: "Enter your name",
    REVIEW_TITLE: "Summarize your experience",
    REVIEW_BODY: "Share details about fabric, fit, drape, and quality to help other patrons make informed decisions.",
  },
  COUPON: {
    PROMO_CODE: "Enter promo code",
    PROMO_CODE_HINT: "Enter promo code to apply discount",
  },
  PAYMENT: {
    UPI_VPA: "Enter UPI VPA ID (e.g., username@bank)",
    UPI_MOBILE: "Enter 10-digit UPI-linked mobile number",
    CARD_HOLDER: "Enter cardholder name",
    CARD_NUMBER: "Enter 16-digit card number",
    CARD_EXPIRY: "MM/YY",
    CARD_CVV: "CVV",
    CUSTOMER_ID: "Enter Customer ID",
    NETBANKING_PIN: "Enter NetBanking PIN",
  },
  TRACKING: {
    ORDER_ID: "Enter Order ID (e.g., ODR-XXXXXXXX-IN)",
    EMAIL: "Enter registered email address",
  },
  SUPPORT: {
    FEEDBACK: "Describe your query or feedback in detail...",
  },
  ADMIN: {
    SECURITY_KEY: "Enter administrative passkey",
    PRODUCT_NAME: "Enter product title",
    PRODUCT_CATEGORY: "Select or enter product category",
    TAGS: "Enter comma-separated tags (e.g., Low Stock, Organic)",
    COUPON_CODE: "Enter coupon code",
    COUPON_DESC: "Enter coupon description",
    MIN_ORDER: "Enter minimum order amount (₹)",
  },
  SEARCH: {
    INPUT: "Search products, categories, or handcrafted styles...",
  },
} as const;
