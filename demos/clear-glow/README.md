# Clear Glow beauty storefront

Responsive cosmetics storefront inspired by the supplied blush-pink beauty-shop reference.

## Features
- Responsive layout, mobile navigation and category browsing
- Product catalogue with category filters and cart quantity controls
- Subtotal calculation and WhatsApp order handoff with itemised summary
- Optional Google Sheets CSV product feed
- Optional hosted payment URL
- Skin-care guidance enquiry and contact section
- SEO and social-sharing metadata

## Configuration
Edit config.js. The WhatsApp number is preconfigured as 27616100885. To connect a dedicated Clear Glow inventory, create a Google Sheet with these headers: id,name,category,price,description,image,stock. Publish the product worksheet as CSV (File → Share → Publish to web → CSV) and paste the published CSV URL into googleSheetCsvUrl. Product rows in products.csv are sample fallback content and the sample names/prices must be replaced with the confirmed product catalogue.

The Frame It Agency products-template spreadsheet is the agency's website-template marketplace catalogue, not Clear Glow's cosmetics inventory. It is kept separate and is only used for the Frame It marketplace listing.

Add a hosted payment page URL to paymentUrl if one is available. WhatsApp is an enquiry/order handoff, not payment verification. A static payment URL does not confirm payment; automated verification requires a secure backend and provider webhooks. Never expose secret credentials in frontend files.

## Before launch
Replace sample product information and photos with confirmed stock. Add confirmed business email, address, operating hours and delivery terms. Skin-care guidance is general information, not a clinical or medical service.

## Preview
https://frameitagency.github.io/frame-it-marketplace/demos/clear-glow/
