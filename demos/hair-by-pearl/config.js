/**
 * Hair by Pearl — Site & Storefront Configuration
 * Frame It Agency Template (ID: FI007)
 */
const SITE_CONFIG = {
  businessName: "Hair by Pearl",
  tagline: "Luxury Hair Pieces, Wigs, Weaves & Hair Care",
  currency: "ZAR",
  currencySymbol: "R",

  // WhatsApp Business Number (South Africa format: 27 + number without leading 0)
  whatsappNumber: "27616100885",
  displayPhone: "061 610 0885",

  // Google Sheets Published CSV Feed URL
  // To connect live updates: File -> Share -> Publish to web -> CSV -> Paste URL below
  googleSheetCsvUrl: "",

  // Local fallback CSV path (works on GitHub Pages subfolder deployments)
  fallbackCsvUrl: "./products.csv",

  // Configurable Hosted Payment Link (e.g., PayFast, Yoco, Paystack, Ozow)
  // Leave empty if payment provider is not yet configured
  paymentProvider: {
    enabled: false,
    providerName: "Yoco / PayFast (Pending Setup)",
    checkoutUrl: "", // e.g., "https://pay.yoco.com/hair-by-pearl"
    instructions: "Complete your order via WhatsApp to receive EFT banking details or a secure payment link."
  },

  // Store Location & Hours
  location: {
    city: "South Africa (Nationwide Courier & Local Collection)",
    hours: "Mon – Sat: 08:30 – 18:00 | Sun: By Appointment"
  }
};
