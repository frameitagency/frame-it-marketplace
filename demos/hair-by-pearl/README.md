# Hair by Pearl — Luxury Hair & Beauty Storefront

A complete, responsive e-commerce storefront template built for **Hair by Pearl** by **Frame It Agency**.

## Features
- **Product Catalogue (`products.csv` & Google Sheets Sync)**: Displays wigs, weaves, hair pieces, and hair care products in South African Rand (`ZAR`).
- **Category Filtering & Live Search**: Instant filtering by product category and keyword search.
- **Interactive Shopping Bag**: Add/remove items, adjust quantities within stock limits, and calculate live subtotals.
- **WhatsApp Order Handoff**: Generates a formatted WhatsApp order enquiry containing customer name, contact details, itemized quantities, prices, and subtotal to `061 610 0885`.
- **Configurable Payment Provider**: Supports hosted checkout links (Yoco, PayFast, Paystack, Ozow) via `config.js`.

## Folder Structure
```text
hair-by-pearl/
├── index.html
├── styles.css
├── app.js
├── config.js
├── products.csv
├── README.md
└── assets/
    ├── images/
    ├── thumbnails/
    │   └── hair-by-pearl-preview.svg
    └── icons/
```

## Google Sheets Product Management Setup
1. Create a Google Sheet with columns: `id, name, category, price, description, image, stock`
2. Click **File → Share → Publish to web**.
3. Select the worksheet and choose **Comma-separated values (.csv)**, then click **Publish**.
4. Copy the generated CSV URL and paste it into `SITE_CONFIG.googleSheetCsvUrl` inside `config.js`.
