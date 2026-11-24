# Hair by Pearl — website demo

A responsive, enquiry-led hair and beauty catalogue built for Hair by Pearl.

## Included
- Responsive editorial-style landing page
- Wigs, hairpieces and hair-care catalogue
- Category filters and search
- Enquiry bag with quantity controls
- Customer name and phone fields
- WhatsApp enquiry summary (not an automatic order or payment confirmation)
- CSV product feed with optional published Google Sheets CSV integration
- SEO and social sharing metadata

## Business configuration
Edit `config.js`:
- `whatsappNumber`: South African number in international digits-only format
- `sheetCsvUrl`: published Google Sheets CSV URL (leave blank to use local `products.csv`)

## Product catalogue
The fallback `products.csv` uses these columns:
`id,name,category,price,description,image,stock`

To connect a Google Sheet:
1. Create or use a product catalogue tab with those exact column names.
2. Add product rows; use numeric prices in ZAR and image URLs.
3. In Google Sheets choose **File → Share → Publish to web**.
4. Select the product tab and CSV format, then publish.
5. Paste the published CSV URL into `sheetCsvUrl` in `config.js`.

Changes to the published sheet are picked up on page refresh. Do not put payment credentials or secret API keys in frontend files.

## Product demo data
The four rows in `products.csv` are presentation examples, not verified Hair by Pearl inventory or prices. Replace them with Pearl's actual product names, descriptions, image links, prices and stock before accepting customer orders. Blank prices display as **Price on request**.

## Local preview
Run `python -m http.server 8000` in this folder and visit `http://localhost:8000`.
