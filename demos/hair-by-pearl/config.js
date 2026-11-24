/**
 * Hair by Pearl — Glam Pink Boutique Configuration
 * Frame It Agency Template (ID: FI007)
 */
const SITE_CONFIG = {
  businessName: "Hair by Pearl",
  tagline: "Glam Luxury Wigs, Weaves, Hair Pieces & Hair Care",
  currency: "ZAR",
  currencySymbol: "R",

  // WhatsApp Business Number (South Africa format: 27 + number without leading 0)
  whatsappNumber: "27616100885",
  displayPhone: "061 610 0885",

  // Google Sheets Published CSV Feed URL
  // File -> Share -> Publish to web -> CSV -> Paste URL below
  googleSheetCsvUrl: "",

  // Local fallback CSV path (works inside GitHub Pages subfolders)
  fallbackCsvUrl: "./products.csv",

  // Configurable Hosted Payment Link (e.g., Yoco, PayFast, Paystack, Ozow)
  paymentProvider: {
    enabled: false,
    providerName: "Yoco / PayFast",
    checkoutUrl: "",
    instructions: "Order via WhatsApp to confirm stock and receive EFT details or a secure payment link."
  },

  location: {
    city: "South Africa (Nationwide Courier & Local Collection)",
    hours: "Mon – Sat: 08:30 – 18:00 | Sun: By Appointment"
  }
};
