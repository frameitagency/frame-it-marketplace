# Frame It Agency Marketplace

Static site: HTML, CSS and JavaScript only. No build step, database, payments or backend.

**Files:** `site.config.js` (WhatsApp, email, socials, location, message template) · `products.json` (every website for sale) · `assets/` (thumbnails) · `preview.html` (demo viewer with a "Back to marketplace" bar).

## First setup
1. Open `site.config.js` and set `whatsappNumber` (country code plus number, digits only). Add `email` and social URLs when you have them.
2. Replace each `previewUrl` in `products.json` with the real GitHub Pages URL of the demo. The current `example.github.io` URLs are placeholders.

## Daily tasks (all in `products.json`)
1. **Add a website:** copy an existing block, give it a new unique `id` (FI011), then fill in name, category (must match a name in `site.config.js`), price, description, previewUrl, thumbnail, `added` date, `status`, `featured` and `features`.
2. **Change a price:** edit `price` (a number in rand, no "R").
3. **Replace a preview image:** save a new image (about 1280x800, WebP, under 150 KB) in `assets/` and set `thumbnail` to its path. A tidy placeholder shows if the file is missing.
4. **Update a demo URL:** edit `previewUrl`.
5. **Mark as sold:** set `status` to `"sold"`. Use `"coming-soon"` for unreleased designs. Only `"available"` can be bought; the Buy button is disabled otherwise.
6. **Remove a product:** delete its block (watch the commas).
7. **Publish:** commit and push to `main`. The included GitHub Action deploys in about a minute.

## Publish on GitHub Pages
1. Create a repository (for example `frame-it-marketplace`) and upload these files, including the `.github` folder.
2. Repository **Settings > Pages > Build and deployment > Source: GitHub Actions**.
3. Push to `main`. Your site appears at `https://<username>.github.io/<repo>/`.
4. Publish each demo the same way from its own repository, then paste its URL into `previewUrl`.

## Test locally
Browsers block `fetch` on `file://`, so run `python3 -m http.server 8000` in this folder and open http://localhost:8000.

## Notes
- The marketplace never transfers repositories or grants GitHub access. Handover is manual.
- Preview opens `preview.html`, which frames the live demo under a bar with a back link, "Open demo alone" and Buy. If a demo ever refuses to be framed, use "Open demo alone".

## Manage products in Google Sheets (recommended)
1. In Google Sheets choose **File > Import > Upload**, select `products-template.csv` and pick **Replace spreadsheet**. Format the `added` column as **Plain text** so dates stay as 2026-11-16.
2. Choose **File > Share > Publish to web**, select the sheet tab, set the format to **Comma-separated values (.csv)**, click **Publish**, and copy the link.
3. Open `site.config.js`, paste the link between the quotes of `sheetCsvUrl`, and commit.
4. From then on, edit the sheet only. Changes appear on the store after Google refreshes the published sheet (usually a few minutes).

Column rules: `id` unique (FI011); `price` a number; `category` must match `site.config.js` exactly; `status` is available, sold or coming-soon; `featured` is TRUE or FALSE; `features` are separated by `|`; `thumbnail` is a path like `assets/nails.webp` or a full image link. Rows without an id or name are ignored.
If the sheet can't be reached, the store falls back to `products.json`.
