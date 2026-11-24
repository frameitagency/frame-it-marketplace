/**
 * Hair by Pearl — Storefront Logic
 * Supports Google Sheets CSV feed, local CSV fallback, ZAR currency,
 * interactive shopping cart, WhatsApp order summary, and configurable payment link.
 */
(function () {
  let allProducts = [];
  let activeCategory = "All";
  let searchQuery = "";
  let cart = JSON.parse(localStorage.getItem("hairByPearlCart") || "[]");

  const productGrid = document.getElementById("productGrid");
  const categoryTabs = document.getElementById("categoryTabs");
  const searchInput = document.getElementById("searchInput");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartItemsEl = document.getElementById("cartItems");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const cartCountEl = document.getElementById("cartCount");
  const toastEl = document.getElementById("toast");

  function formatZAR(amount) {
    const num = Number(amount) || 0;
    return `${SITE_CONFIG.currencySymbol}${num.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  function parseCSV(text) {
    const rows = [];
    let current = "";
    let row = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (char === '"' && next === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          row.push(current.trim());
          current = "";
        } else if (char === "\n" || (char === "\r" && next === "\n")) {
          row.push(current.trim());
          if (row.some(cell => cell !== "")) rows.push(row);
          row = [];
          current = "";
          if (char === "\r") i++;
        } else {
          current += char;
        }
      }
    }
    if (current.length > 0 || row.length > 0) {
      row.push(current.trim());
      if (row.some(cell => cell !== "")) rows.push(row);
    }

    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.toLowerCase().trim());

    return rows.slice(1).map((cols, idx) => {
      const item = {};
      headers.forEach((h, i) => {
        item[h] = cols[i] !== undefined ? cols[i] : "";
      });
      return {
        id: item.id || `ITEM-${idx + 1}`,
        name: item.name || "Luxury Hair Piece",
        category: item.category || "Hair Collection",
        price: parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0,
        description: item.description || "",
        image: item.image || "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=85",
        stock: parseInt(item.stock, 10) || 0
      };
    });
  }

  async function loadProducts() {
    const feedUrl = (SITE_CONFIG.googleSheetCsvUrl && SITE_CONFIG.googleSheetCsvUrl.trim())
      ? SITE_CONFIG.googleSheetCsvUrl.trim()
      : SITE_CONFIG.fallbackCsvUrl;

    try {
      const response = await fetch(feedUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load product feed");
      const csvText = await response.text();
      allProducts = parseCSV(csvText);
    } catch (err) {
      console.warn("Primary product feed failed, attempting local fallback:", err);
      if (feedUrl !== SITE_CONFIG.fallbackCsvUrl) {
        const fallbackResp = await fetch(SITE_CONFIG.fallbackCsvUrl);
        const fallbackText = await fallbackResp.text();
        allProducts = parseCSV(fallbackText);
      }
    }

    renderCategoryTabs();
    renderProducts();
    updateCartUI();
  }

  function renderCategoryTabs() {
    if (!categoryTabs) return;
    const categories = ["All", ...new Set(allProducts.map(p => p.category).filter(Boolean))];
    categoryTabs.innerHTML = categories.map(cat => `
      <button class="filter-btn ${cat === activeCategory ? "active" : ""}" data-category="${cat}">
        ${cat}
      </button>
    `).join("");

    categoryTabs.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.category;
        renderCategoryTabs();
        renderProducts();
      });
    });
  }

  function renderProducts() {
    if (!productGrid) return;
    const filtered = allProducts.filter(p => {
      const matchesCat = activeCategory === "All" || p.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      productGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:2rem;">No hair pieces or products matched your filter. Try selecting "All".</p>`;
      return;
    }

    productGrid.innerHTML = filtered.map(p => {
      const inStock = p.stock > 0;
      return `
        <article class="product-card">
          <div class="product-img-wrap">
            <img src="${p.image}" alt="${p.name}" loading="lazy" />
            <span class="product-badge">${p.category}</span>
            <span class="stock-badge">${inStock ? `${p.stock} in stock` : "Out of stock"}</span>
          </div>
          <div class="product-body">
            <h3 class="product-title">${p.name}</h3>
            <p class="product-desc">${p.description}</p>
            <div class="product-footer">
              <span class="product-price">${formatZAR(p.price)}</span>
              <button class="add-to-cart-btn" data-id="${p.id}" ${inStock ? "" : "disabled"}>
                ${inStock ? "+ Add to Bag" : "Sold Out"}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    productGrid.querySelectorAll(".add-to-cart-btn").forEach(btn => {
      btn.addEventListener("click", () => addToCart(btn.dataset.id));
    });
  }

  function saveCart() {
    localStorage.setItem("hairByPearlCart", JSON.stringify(cart));
  }

  function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
      if (existing.qty < product.stock) {
        existing.qty += 1;
      } else {
        showToast("Maximum available stock reached.");
        return;
      }
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: 1
      });
    }
    saveCart();
    updateCartUI();
    showToast(`Added "${product.name}" to your bag`);
  }

  function updateQty(productId, delta) {
    const idx = cart.findIndex(item => item.id === productId);
    if (idx === -1) return;
    const product = allProducts.find(p => p.id === productId);
    const maxStock = product ? product.stock : 99;

    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) {
      cart.splice(idx, 1);
    } else if (cart[idx].qty > maxStock) {
      cart[idx].qty = maxStock;
    }
    saveCart();
    updateCartUI();
  }

  function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
  }

  function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountEl) cartCountEl.textContent = totalCount;
    if (cartSubtotalEl) cartSubtotalEl.textContent = formatZAR(getSubtotal());

    if (!cartItemsEl) return;
    if (cart.length === 0) {
      cartItemsEl.innerHTML = `<div class="cart-empty"><p>Your shopping bag is currently empty.</p><p style="font-size:0.84rem;margin-top:0.5rem;">Explore our luxury wigs, weaves, hair pieces, and hair care essentials.</p></div>`;
      return;
    }

    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${formatZAR(item.price)} each</div>
          <div>
            <div class="qty-controls">
              <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove-item-btn" data-action="remove" data-id="${item.id}">Remove</button>
          </div>
        </div>
      </div>
    `).join("");

    cartItemsEl.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (action === "inc") updateQty(id, 1);
        if (action === "dec") updateQty(id, -1);
        if (action === "remove") removeItem(id);
      });
    });
  }

  function openCart() {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("open");
  }

  function closeCart() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("open");
  }

  function sendWhatsAppOrder() {
    if (cart.length === 0) {
      showToast("Please add at least one item to your bag first.");
      return;
    }
    const custName = document.getElementById("customerName").value.trim();
    const custContact = document.getElementById("customerContact").value.trim();
    const custNotes = document.getElementById("customerNotes").value.trim();

    if (!custName || !custContact) {
      showToast("Please enter your name and phone/email contact details.");
      return;
    }

    const lines = cart.map((item, i) =>
      `${i + 1}. ${item.name} — Qty: ${item.qty} x ${formatZAR(item.price)} = ${formatZAR(item.price * item.qty)}`
    ).join("\n");

    const message = [
      `Hello ${SITE_CONFIG.businessName}! I would like to place an order enquiry:`,
      ``,
      `*Customer Name:* ${custName}`,
      `*Contact Details:* ${custContact}`,
      custNotes ? `*Delivery / Notes:* ${custNotes}` : null,
      ``,
      `*Order Summary:*`,
      lines,
      ``,
      `*Estimated Subtotal:* ${formatZAR(getSubtotal())}`,
      ``,
      `Please confirm stock availability and send payment/collection details.`
    ].filter(Boolean).join("\n");

    const url = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  }

  function initPaymentButton() {
    const payBtn = document.getElementById("hostedPaymentBtn");
    const payNote = document.getElementById("paymentStatusNote");
    if (!payBtn || !payNote) return;

    if (SITE_CONFIG.paymentProvider.enabled && SITE_CONFIG.paymentProvider.checkoutUrl) {
      payBtn.style.display = "inline-flex";
      payBtn.textContent = `Pay Online via ${SITE_CONFIG.paymentProvider.providerName}`;
      payBtn.addEventListener("click", () => {
        if (cart.length === 0) {
          showToast("Add items to your bag before proceeding to payment.");
          return;
        }
        window.open(SITE_CONFIG.paymentProvider.checkoutUrl, "_blank", "noopener");
      });
    } else {
      payBtn.style.display = "none";
      payNote.textContent = SITE_CONFIG.paymentProvider.instructions;
    }
  }

  document.getElementById("openCartBtn")?.addEventListener("click", openCart);
  document.getElementById("closeCartBtn")?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);

  document.getElementById("mobileMenuBtn")?.addEventListener("click", () => {
    document.getElementById("mobileNav")?.classList.toggle("open");
  });

  document.querySelectorAll("#mobileNav a").forEach(link => {
    link.addEventListener("click", () => {
      document.getElementById("mobileNav")?.classList.remove("open");
    });
  });

  searchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });

  document.getElementById("whatsappCheckoutBtn")?.addEventListener("click", sendWhatsAppOrder);

  document.getElementById("enquiryForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("enqName").value.trim();
    const phone = document.getElementById("enqPhone").value.trim();
    const interest = document.getElementById("enqInterest").value;
    const msg = document.getElementById("enqMessage").value.trim();

    const waText = [
      `Hi ${SITE_CONFIG.businessName}, I have a hair enquiry:`,
      `*Name:* ${name}`,
      `*Contact:* ${phone}`,
      `*Looking for:* ${interest}`,
      msg ? `*Details:* ${msg}` : null
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(waText)}`, "_blank", "noopener");
  });

  initPaymentButton();
  loadProducts();
})();
