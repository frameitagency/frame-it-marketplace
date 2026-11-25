/**
 * evo-lution Store Configuration
 * Frame It Agency E-Commerce Template
 */
const STORE_CONFIG = {
  storeName: "evo-lution",
  tagline: "Certified Pre-Owned iPhones & Tech Essentials",
  currency: "ZAR",
  currencySymbol: "R",
  whatsappNumber: "27616100885", // Formatted from 0616100885 for wa.me
  displayPhone: "061 610 0885",
  email: "sales@evo-lution.co.za",
  location: "uMhlanga / Durban, KwaZulu-Natal, South Africa",
  businessHours: "Mon – Sat: 09:00 – 18:00 | Sun: 10:00 – 15:00",
  
  // Google Sheets Published CSV Feed URL
  // Publish your sheet via File > Share > Publish to web > CSV and paste the link below.
  // Leave empty ("") to use the built-in fallback catalogue / local products.csv.
  googleSheetCsvUrl: "",
  localCsvPath: "./products.csv",

  // Payment Configuration (Configurable Hosted Payment Link / Provider)
  paymentProvider: {
    enabled: false, // Set to true once hosted payment link is configured
    providerName: "PayFast / Yoco Hosted Checkout",
    checkoutUrl: "", // e.g., "https://pay.yoco.com/evo-lution" or PayFast payment link
    instructions: "Online card & EFT payments are processed securely via our verified payment gateway."
  }
};
