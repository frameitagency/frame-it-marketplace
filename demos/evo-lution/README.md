# evo-lution — Certified Pre-Owned iPhones & Tech Storefront

Built by **Frame It Agency** for **evo-lution**.

## Features
- Editorial tech layout inspired by clean minimalist electronics storefronts (slate hero header with curved SVG transition, floating white navigation bar, asymmetric showcase cards, and 4-column product grids).
- Responsive across desktop, tablet, and mobile devices with slide-over shopping bag and quick-view modal.
- **Google Sheets Live CSV Product Feed** (`id, name, category, price, description, image, stock`).
- **ZAR Shopping Cart & WhatsApp Checkout** configured for `061 610 0885` (`27616100885`).
- Configurable hosted payment gateway integration in `config.js`.

## Managing Products via Google Sheets
1. Create a Google Sheet with columns: `id, name, category, price, description, image, stock`.
2. Go to **File → Share → Publish to web**, choose your worksheet, and select **Comma-separated values (.csv)**.
3. Copy the published `.csv` URL and paste it into `STORE_CONFIG.googleSheetCsvUrl` in `config.js`.
4. Updating prices, stock counts, image URLs, or adding/removing rows in Google Sheets will automatically reflect on the live website without editing HTML/JS code.
