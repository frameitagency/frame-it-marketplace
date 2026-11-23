# Sage skincare store template

A responsive skincare storefront with a product catalogue, filters, cart, WhatsApp order handoff, Google Sheets CSV product feed and a configurable hosted payment link.

## Setup
1. Edit `config.js` and replace `27XXXXXXXXX` with the store's WhatsApp number in international format, digits only.
2. Create a Google Sheet with columns exactly: `id,name,category,price,description,image,stock`.
3. Publish that product sheet as CSV (Google Sheets: File → Share → Publish to web → CSV) and paste the URL into `googleSheetCsvUrl` in `config.js`.
4. Add a hosted payment page URL to `paymentUrl`. This starter opens a static payment link; it does not create a unique payment for each cart or verify payment automatically.
5. Replace the Sage demo brand, sample copy, product images, prices and contact details before handing the template to a customer.

## Preview
Open `index.html` through a local web server (such as VS Code Live Server). The Google Sheets CSV fetch may not work when opening the file directly with `file://`.

## Production note
WhatsApp ordering is a handoff that sends the cart summary to the configured number. For verified checkout and order confirmation, connect a payment provider through a secure server-side backend. Never put secret payment keys in browser JavaScript.