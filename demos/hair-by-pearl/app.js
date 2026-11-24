(function () {
  let items = [];
  let selectedCat = "All";
  let searchTerm = "";
  let bag = JSON.parse(localStorage.getItem("hairByPearlBagV5") || "[]");

  const grid = document.getElementById("productGrid");
  const tabs = document.getElementById("pillTabs");
  const search = document.getElementById("boutiqueSearch");
  const panel = document.getElementById("bagPanel");
  const backdrop = document.getElementById("bagBackdrop");
  const bagList = document.getElementById("bagScroll");
  const subTotalEl = document.getElementById("bagSubtotal");
  const countEl = document.getElementById("bagCount");
  const toastEl = document.getElementById("toastBar");

  function moneyZAR(val) {
    const n = Number(val) || 0;
    return `${SITE_CONFIG.currencySymbol}${n.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // Ensures no image link or URL ever appears inside the product description text
  function stripUrls(txt) {
    return String(txt || "")
      .replace(/https?:\/\/\S+/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function notify(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2500);
  }

  function parseCsvData(raw) {
    const rows = [];
    let field = "";
    let row = [];
    let inQuotes = false;

    for (let i = 0; i < raw.length; i++) {
      const c = raw[i];
      const next = raw[i + 1];
      if (inQuotes) {
        if (c === '"' && next === '"') {
          field += '"';
          i++;
        } else if (c === '"') {
          inQuotes = false;
        } else {
          field += c;
        }
      } else {
        if (c === '"') {
          inQuotes = true;
        } else if (c === ",") {
          row.push(field.trim());
          field = "";
        } else if (c === "\n" || (c === "\r" && next === "\n")) {
          row.push(field.trim());
          if (row.some(x => x !== "")) rows.push(row);
          row = [];
          field = "";
          if (c === "\r") i++;
        } else {
          field += c;
        }
      }
    }
    if (field.length > 0 || row.length > 0) {
      row.push(field.trim());
      if (row.some(x => x !== "")) rows.push(row);
    }

    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.toLowerCase().trim());

    return rows.slice(1).map((cols, idx) => {
      const rec = {};
      headers.forEach((h, i) => {
        rec[h] = cols[i] !== undefined ? cols[i] : "";
      });
      return {
        id: rec.id || `HP-${idx + 1}`,
        name: rec.name || "Luxury Hair Piece",
        category: rec.category || "Hair",
        price: parseFloat(String(rec.price).replace(/[^0-9.]/g, "")) || 0,
        description: stripUrls(rec.description),
        image: rec.image || "https://images.unsplash.com/photo-1522337094846-8a818192de1f?auto=format&fit=crop&w=800&q=85",
        stock: parseInt(rec.stock, 10) || 0
      };
    });
  }

  async function bootStore() {
    const feed = (SITE_CONFIG.googleSheetCsvUrl && SITE_CONFIG.googleSheetCsvUrl.trim())
      ? SITE_CONFIG.googleSheetCsvUrl.trim()
      : SITE_CONFIG.fallbackCsvUrl;

    try {
      const res = await fetch(feed, { cache: "no-store" });
      if (!res.ok) throw new Error("Feed error");
      items = parseCsvData(await res.text());
    } catch (e) {
      if (feed !== SITE_CONFIG.fallbackCsvUrl) {
        const fb = await fetch(SITE_CONFIG.fallbackCsvUrl);
        items = parseCsvData(await fb.text());
      }
    }

    drawTabs();
    drawCards();
    drawBag();
  }

  function drawTabs() {
    if (!tabs) return;
    const cats = ["All", ...new Set(items.map(i => i.category).filter(Boolean))];
    tabs.innerHTML = cats.map(c => `
      <button class="tab-btn ${c === selectedCat ? "active" : ""}" data-cat="${c}">${c}</button>
    `).join("");

    tabs.querySelectorAll(".tab-btn").forEach(b => {
      b.addEventListener("click", () => {
        selectedCat = b.dataset.cat;
        drawTabs();
        drawCards();
      });
    });
  }

  function drawCards() {
    if (!grid) return;
    const filtered = items.filter(p => {
      const catOk = selectedCat === "All" || p.category === selectedCat;
      const q = searchTerm.toLowerCase();
      const qOk = !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return catOk && qOk;
    });

    if (!filtered.length) {
      grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--muted-rose);padding:2rem;">No hair products found matching your search.</p>`;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const available = p.stock > 0;
      return `
        <article class="hair-card">
          <div class="hair-photo">
            <img src="${p.image}" alt="${p.name}" loading="lazy" />
            <span class="pill-category">${p.category}</span>
          </div>
          <div class="hair-details">
            <h3 class="hair-name">${p.name}</h3>
            <p class="hair-desc">${p.description}</p>
            <div class="hair-buy-row">
              <span class="hair-price">${moneyZAR(p.price)}</span>
              <button class="btn-add-cart" data-id="${p.id}" ${available ? "" : "disabled"}>
                ${available ? "Add to Cart" : "Sold Out"}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    grid.querySelectorAll(".btn-add-cart").forEach(btn => {
      btn.addEventListener("click", () => addBagItem(btn.dataset.id));
    });
  }

  function persistBag() {
    localStorage.setItem("hairByPearlBagV5", JSON.stringify(bag));
  }

  function addBagItem(id) {
    const product = items.find(i => i.id === id);
    if (!product) return;
    const existing = bag.find(i => i.id === id);
    if (existing) {
      if (existing.qty < product.stock) existing.qty += 1;
      else { notify("Maximum stock reached"); return; }
    } else {
      bag.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
    }
    persistBag();
    drawBag();
    notify(`Added ${product.name}`);
  }

  function adjustQty(id, delta) {
    const idx = bag.findIndex(i => i.id === id);
    if (idx === -1) return;
    const product = items.find(i => i.id === id);
    const limit = product ? product.stock : 99;
    bag[idx].qty += delta;
    if (bag[idx].qty <= 0) bag.splice(idx, 1);
    else if (bag[idx].qty > limit) bag[idx].qty = limit;
    persistBag();
    drawBag();
  }

  function removeBagItem(id) {
    bag = bag.filter(i => i.id !== id);
    persistBag();
    drawBag();
  }

  function calcTotal() {
    return bag.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function drawBag() {
    const count = bag.reduce((sum, i) => sum + i.qty, 0);
    if (countEl) countEl.textContent = count;
    if (subTotalEl) subTotalEl.textContent = moneyZAR(calcTotal());
    if (!bagList) return;

    if (!bag.length) {
      bagList.innerHTML = `<p style="text-align:center;color:var(--muted-rose);padding:2.5rem 1rem;">Your bag is empty. Add your favorite wigs, bundles, or hair care!</p>`;
      return;
    }

    bagList.innerHTML = bag.map(i => `
      <div class="bag-item">
        <img src="${i.image}" alt="${i.name}" />
        <div style="flex:1;">
          <div style="font-weight:700;font-size:0.9rem;">${i.name}</div>
          <div style="color:var(--hot-pink);font-weight:800;font-size:0.84rem;">${moneyZAR(i.price)}</div>
          <div>
            <div class="qty-pill">
              <button data-op="dec" data-id="${i.id}">-</button>
              <span>${i.qty}</span>
              <button data-op="inc" data-id="${i.id}">+</button>
            </div>
            <button class="rm-link" data-op="rm" data-id="${i.id}">Remove</button>
          </div>
        </div>
      </div>
    `).join("");

    bagList.querySelectorAll("[data-op]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.op === "inc") adjustQty(btn.dataset.id, 1);
        if (btn.dataset.op === "dec") adjustQty(btn.dataset.id, -1);
        if (btn.dataset.op === "rm") removeBagItem(btn.dataset.id);
      });
    });
  }

  function openBag() {
    panel.classList.add("open");
    backdrop.classList.add("open");
  }

  function closeBag() {
    panel.classList.remove("open");
    backdrop.classList.remove("open");
  }

  function sendWaOrder() {
    if (!bag.length) { notify("Please add items to your bag first"); return; }
    const name = document.getElementById("custName").value.trim();
    const contact = document.getElementById("custContact").value.trim();
    const note = document.getElementById("custNote").value.trim();
    if (!name || !contact) { notify("Please enter your name and contact details"); return; }

    const summary = bag.map((i, idx) =>
      `${idx + 1}. ${i.name} x${i.qty} = ${moneyZAR(i.price * i.qty)}`
    ).join("\n");

    const text = [
      `Hello ${SITE_CONFIG.businessName}! I'd like to place an order:`,
      `Name: ${name}`,
      `Contact: ${contact}`,
      note ? `Notes: ${note}` : null,
      ``,
      summary,
      ``,
      `Estimated Subtotal: ${moneyZAR(calcTotal())}`
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  function initPayment() {
    const payBtn = document.getElementById("onlinePayBtn");
    const noteEl = document.getElementById("payInstructions");
    if (!payBtn || !noteEl) return;
    if (SITE_CONFIG.paymentProvider.enabled && SITE_CONFIG.paymentProvider.checkoutUrl) {
      payBtn.style.display = "inline-flex";
      payBtn.textContent = `Pay via ${SITE_CONFIG.paymentProvider.providerName}`;
      payBtn.addEventListener("click", () => {
        if (!bag.length) { notify("Add items first"); return; }
        window.open(SITE_CONFIG.paymentProvider.checkoutUrl, "_blank", "noopener");
      });
    } else {
      payBtn.style.display = "none";
      noteEl.textContent = SITE_CONFIG.paymentProvider.instructions;
    }
  }

  document.getElementById("openBag")?.addEventListener("click", openBag);
  document.getElementById("closeBag")?.addEventListener("click", closeBag);
  backdrop?.addEventListener("click", closeBag);
  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.getElementById("mobileDrawer")?.classList.toggle("open");
  });
  document.querySelectorAll("#mobileDrawer a").forEach(a => {
    a.addEventListener("click", () => document.getElementById("mobileDrawer")?.classList.remove("open"));
  });
  search?.addEventListener("input", e => { searchTerm = e.target.value; drawCards(); });
  document.getElementById("waCheckout")?.addEventListener("click", sendWaOrder);

  document.getElementById("styleEnquiryForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const n = document.getElementById("sName").value.trim();
    const p = document.getElementById("sPhone").value.trim();
    const c = document.getElementById("sCategory").value;
    const m = document.getElementById("sNotes").value.trim();
    const wa = [`Hi ${SITE_CONFIG.businessName}, hair enquiry:`, `Name: ${n}`, `Contact: ${p}`, `Looking for: ${c}`, m ? `Details: ${m}` : null].filter(Boolean).join("\n");
    window.open(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(wa)}`, "_blank", "noopener");
  });

  initPayment();
  bootStore();
})();
