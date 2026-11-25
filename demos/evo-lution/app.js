/**
 * evo-lution Storefront Application
 * Handles Google Sheets CSV parsing, product filtering, ZAR shopping cart,
 * WhatsApp order handoff, and configurable hosted payment options.
 */

const FALLBACK_PRODUCTS = [
  {
    id: "EVO-001",
    name: "iPhone 15 Pro Max 256GB",
    category: "iPhones",
    price: 19499,
    description: "Natural Titanium • 94% Battery Health • Factory Unlocked • Includes 12-Month Warranty & Fast Charger",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85",
    stock: 4
  },
  {
    id: "EVO-002",
    name: "iPhone 15 Pro 128GB",
    category: "iPhones",
    price: 16999,
    description: "Blue Titanium • 96% Battery Health • Mint Grade A+ Condition • Face ID & True Tone Verified",
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=900&q=85",
    stock: 6
  },
  {
    id: "EVO-003",
    name: "iPhone 14 Pro 256GB",
    category: "iPhones",
    price: 13999,
    description: "Deep Purple • 91% Battery Health • 120Hz ProMotion Display • Original Box & Cable",
    image: "https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=900&q=85",
    stock: 5
  },
  {
    id: "EVO-004",
    name: "iPhone 13 128GB",
    category: "iPhones",
    price: 8999,
    description: "Midnight • 90% Battery Health • Clean Housing • 45-Point Diagnostic Certified",
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=900&q=85",
    stock: 8
  },
  {
    id: "EVO-005",
    name: "Apple Watch Ultra 2",
    category: "Smartwatches",
    price: 12499,
    description: "49mm Titanium Case • Orange Alpine Loop • GPS + Cellular • 98% Battery Health",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=900&q=85",
    stock: 3
  },
  {
    id: "EVO-006",
    name: "AirPods Max",
    category: "Audio",
    price: 7999,
    description: "Space Grey • Active Noise Cancellation • Spatial Audio • Includes Smart Case",
    image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=900&q=85",
    stock: 4
  },
  {
    id: "EVO-007",
    name: "AirPods Pro (2nd Gen)",
    category: "Audio",
    price: 3499,
    description: "USB-C MagSafe Charging Case • Adaptive Transparency • Sanitized & Tested",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=900&q=85",
    stock: 10
  },
  {
    id: "EVO-008",
    name: "MacBook Air M2 13-inch",
    category: "Gadgets",
    price: 15999,
    description: "Midnight • 8GB Unified RAM • 256GB SSD • Low Cycle Count • Includes MagSafe 3 Charger",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85",
    stock: 2
  }
];

let allProducts = [];
let activeCategory = "All";
let searchQuery = "";
let cart = JSON.parse(localStorage.getItem("evolution_cart_v1") || "[]");
let cartToastTimer;

function formatZAR(amount) {
  const num = Number(amount) || 0;
  return `R ${num.toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// RFC-4180 compliant CSV parser for Google Sheets CSV feed
function parseCSV(csvText) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      row.push(cell.trim());
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((v) => v !== "")) rows.push(row);
  }

  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.toLowerCase().trim());

  return rows.slice(1).map((r, idx) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = r[i] !== undefined ? r[i] : "";
    });
    return {
      id: obj.id || `EVO-${idx + 1}`,
      name: obj.name || "Certified Device",
      category: obj.category || "Gadgets",
      price: parseFloat(String(obj.price).replace(/[^0-9.]/g, "")) || 0,
      description: obj.description || "",
      image: obj.image || FALLBACK_PRODUCTS[0].image,
      stock: parseInt(obj.stock, 10) || 0
    };
  });
}

async function loadProducts() {
  const sheetUrl = STORE_CONFIG.googleSheetCsvUrl && STORE_CONFIG.googleSheetCsvUrl.trim();
  const sources = [sheetUrl, STORE_CONFIG.localCsvPath].filter(Boolean);

  for (const src of sources) {
    try {
      const response = await fetch(src, { cache: "no-store" });
      if (!response.ok) continue;
      const text = await response.text();
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        allProducts = parsed;
        renderStore();
        return;
      }
    } catch (err) {
      console.warn(`Could not load catalogue from ${src}, falling back.`, err);
    }
  }

  allProducts = FALLBACK_PRODUCTS;
  renderStore();
}

function createProductCard(product) {
  const inStock = product.stock > 0;
  const card = document.createElement("article");
  card.className = "product-card";
  card.innerHTML = `
    <div class="product-img-wrap">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <span class="stock-pill ${inStock ? "" : "out"}">
        ${inStock ? `${product.stock} in stock` : "Sold Out"}
      </span>
      <button class="quick-add-btn" data-add-id="${product.id}" ${inStock ? "" : "disabled"}>
        ${inStock ? "+ Add to Bag" : "Unavailable"}
      </button>
    </div>
    <div class="product-meta">
      <span class="product-category-label">${product.category}</span>
      <h3 class="product-name" data-view-id="${product.id}">${product.name}</h3>
      <p class="product-desc-short">${product.description}</p>
      <div class="product-price">${formatZAR(product.price)}</div>
    </div>
  `;
  return card;
}

function renderStore() {
  // Featured section: top 4 available items
  const featuredGrid = document.getElementById("featuredGrid");
  if (featuredGrid) {
    featuredGrid.innerHTML = "";
    allProducts.slice(0, 4).forEach((p) => featuredGrid.appendChild(createProductCard(p)));
  }

  // Filter catalogue
  const catalogueGrid = document.getElementById("catalogueGrid");
  const countText = document.getElementById("catalogueCountText");
  if (!catalogueGrid) return;

  const filtered = allProducts.filter((p) => {
    const matchesCat = activeCategory === "All" || p.category.toLowerCase() === activeCategory.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  catalogueGrid.innerHTML = "";
  if (filtered.length === 0) {
    catalogueGrid.innerHTML = `<p style="grid-column: 1 / -1; color: #6b7280;">No matching devices found. Try clearing your search or selecting another category.</p>`;
  } else {
    filtered.forEach((p) => catalogueGrid.appendChild(createProductCard(p)));
  }

  if (countText) {
    countText.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? "device" : "devices"} in ${activeCategory === "All" ? "all categories" : activeCategory} (ZAR)`;
  }
}

function saveCart() {
  localStorage.setItem("evolution_cart_v1", JSON.stringify(cart));
  renderCart();
}

function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product || product.stock <= 0) return;

  const existing = cart.find((item) => item.id === productId);
  let added = false;
  if (existing) {
    if (existing.qty < product.stock) {
      existing.qty += 1;
      added = true;
    }
  } else {
    cart.push({ id: product.id, qty: 1 });
    added = true;
  }
  if (!added) return;

  saveCart();
  const toast = document.getElementById("cartToast");
  if (toast) {
    toast.hidden = false;
    clearTimeout(cartToastTimer);
    cartToastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 1800);
  }
}

function updateCartQty(productId, delta) {
  const index = cart.findIndex((item) => item.id === productId);
  if (index === -1) return;
  const product = allProducts.find((p) => p.id === productId);
  const maxStock = product ? product.stock : 99;

  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  } else if (cart[index].qty > maxStock) {
    cart[index].qty = maxStock;
  }
  saveCart();
}

function renderCart() {
  const container = document.getElementById("cartItemsContainer");
  const badge = document.getElementById("cartBadge");
  const subtotalEl = document.getElementById("cartSubtotal");
  const footer = document.getElementById("cartFooter");

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (badge) badge.textContent = String(totalItems);

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p><strong>Your shopping bag is empty.</strong></p>
        <p style="font-size: 13px; margin-top: 6px;">Browse certified iPhones and tech essentials to add items.</p>
      </div>
    `;
    if (footer) footer.style.display = "none";
    return;
  }

  if (footer) footer.style.display = "block";
  container.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item) => {
    const product = allProducts.find((p) => p.id === item.id);
    if (!product) return;
    const lineTotal = product.price * item.qty;
    subtotal += lineTotal;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <div class="cart-item-title">${product.name}</div>
        <div class="cart-item-price">${formatZAR(product.price)} each</div>
        <div class="qty-controls">
          <button type="button" class="qty-btn" data-qty-id="${product.id}" data-delta="-1" aria-label="Decrease quantity">−</button>
          <span class="qty-val">${item.qty}</span>
          <button type="button" class="qty-btn" data-qty-id="${product.id}" data-delta="1" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 13px; font-weight: 600;">${formatZAR(lineTotal)}</div>
        <button type="button" class="remove-item-btn" data-remove-id="${product.id}">Remove</button>
      </div>
    `;
    container.appendChild(row);
  });

  if (subtotalEl) subtotalEl.textContent = formatZAR(subtotal);
}

function renderPaymentProvider() {
  const box = document.getElementById("paymentProviderBox");
  if (!box) return;

  const cfg = STORE_CONFIG.paymentProvider;
  if (cfg && cfg.enabled && cfg.checkoutUrl) {
    box.innerHTML = `
      <div><strong>Online Payment Option (${cfg.providerName}):</strong></div>
      <p style="margin-top: 3px;">${cfg.instructions}</p>
      <a href="${cfg.checkoutUrl}" target="_blank" rel="noopener noreferrer" class="btn-pay-link">
        Proceed to ${cfg.providerName} →
      </a>
    `;
  } else {
    box.innerHTML = `
      <div><strong>Payment Options:</strong> Instant EFT, Cash on Collection, or Card Link on WhatsApp.</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Hosted payment gateway link ready to enable in <code>config.js</code>.</div>
    `;
  }
}

function openCart() {
  document.getElementById("cartBackdrop").hidden = false;
  document.getElementById("cartDrawer").hidden = false;
}

function closeCart() {
  document.getElementById("cartBackdrop").hidden = true;
  document.getElementById("cartDrawer").hidden = true;
}

function openProductModal(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;
  const backdrop = document.getElementById("productModalBackdrop");
  const content = document.getElementById("modalContent");

  content.innerHTML = `
    <img src="${product.image}" alt="${product.name}" />
    <div>
      <span class="product-category-label">${product.category} • SKU ${product.id}</span>
      <h2 id="modalTitle" style="font-size: 22px; margin: 6px 0 10px;">${product.name}</h2>
      <div style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">${formatZAR(product.price)}</div>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 18px;">${product.description}</p>
      <p style="font-size: 12.5px; color: #16a34a; font-weight: 600; margin-bottom: 18px;">
        ${product.stock > 0 ? `✓ In Stock (${product.stock} units available)` : "Currently Sold Out"}
      </p>
      <button type="button" class="btn-dark full-width" data-modal-add="${product.id}" ${product.stock > 0 ? "" : "disabled"}>
        Add to Shopping Bag
      </button>
    </div>
  `;
  backdrop.hidden = false;
}

function closeProductModal() {
  document.getElementById("productModalBackdrop").hidden = true;
}

function setActiveCategory(category) {
  activeCategory = category;
  document.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category.toLowerCase() === category.toLowerCase());
  });
  renderStore();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("currentYear").textContent = new Date().getFullYear();
  renderPaymentProvider();
  loadProducts();
  renderCart();

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  mobileMenuBtn?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  // Search Toggle
  const searchToggleBtn = document.getElementById("searchToggleBtn");
  const searchDrawer = document.getElementById("searchDrawer");
  const searchInput = document.getElementById("searchInput");
  searchToggleBtn?.addEventListener("click", () => {
    searchDrawer.hidden = !searchDrawer.hidden;
    if (!searchDrawer.hidden) searchInput.focus();
  });

  searchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderStore();
  });

  document.getElementById("searchClearBtn")?.addEventListener("click", () => {
    searchQuery = "";
    searchInput.value = "";
    renderStore();
  });

  // Category Filter Pills & Nav Links
  document.getElementById("categoryFilterBar")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-pill");
    if (!btn) return;
    setActiveCategory(btn.dataset.category);
  });

  document.querySelectorAll("[data-filter-link]").forEach((link) => {
    link.addEventListener("click", () => {
      setActiveCategory(link.dataset.filterLink);
      navLinks.classList.remove("open");
    });
  });

  // Delegated Product Grid & Cart Clicks
  document.body.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add-id]");
    if (addBtn) {
      addToCart(addBtn.dataset.addId);
      return;
    }

    const modalAddBtn = e.target.closest("[data-modal-add]");
    if (modalAddBtn) {
      closeProductModal();
      addToCart(modalAddBtn.dataset.modalAdd);
      return;
    }

    const viewBtn = e.target.closest("[data-view-id]");
    if (viewBtn) {
      openProductModal(viewBtn.dataset.viewId);
      return;
    }

    const qtyBtn = e.target.closest("[data-qty-id]");
    if (qtyBtn) {
      updateCartQty(qtyBtn.dataset.qtyId, Number(qtyBtn.dataset.delta));
      return;
    }

    const removeBtn = e.target.closest("[data-remove-id]");
    if (removeBtn) {
      cart = cart.filter((item) => item.id !== removeBtn.dataset.removeId);
      saveCart();
    }
  });

  // Cart & Modal Open/Close
  document.getElementById("cartOpenBtn")?.addEventListener("click", openCart);
  document.getElementById("cartCloseBtn")?.addEventListener("click", closeCart);
  document.getElementById("cartBackdrop")?.addEventListener("click", closeCart);
  document.getElementById("modalCloseBtn")?.addEventListener("click", closeProductModal);
  document.getElementById("productModalBackdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "productModalBackdrop") closeProductModal();
  });

  // WhatsApp Order Summary Checkout
  document.getElementById("checkoutForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const custName = document.getElementById("custName").value.trim();
    const custPhone = document.getElementById("custPhone").value.trim();
    const custCity = document.getElementById("custCity").value.trim();

    let subtotal = 0;
    const itemLines = cart
      .map((item, index) => {
        const product = allProducts.find((p) => p.id === item.id);
        if (!product) return "";
        const lineTotal = product.price * item.qty;
        subtotal += lineTotal;
        return `${index + 1}. ${product.name} (${product.id}) — Qty: ${item.qty} x ${formatZAR(product.price)} = ${formatZAR(lineTotal)}`;
      })
      .filter(Boolean);

    const messageLines = [
      `*NEW ORDER ENQUIRY — ${STORE_CONFIG.storeName.toUpperCase()}*`,
      ``,
      `*Customer Details:*`,
      `• Name: ${custName}`,
      `• Contact: ${custPhone}`,
      custCity ? `• Delivery Area: ${custCity}` : null,
      ``,
      `*Selected Items:*`,
      ...itemLines,
      ``,
      `*Subtotal:* ${formatZAR(subtotal)}`,
      ``,
      `Please confirm stock availability and delivery/payment details.`
    ].filter((line) => line !== null);

    const encoded = encodeURIComponent(messageLines.join("\n"));
    window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encoded}`, "_blank", "noopener,noreferrer");
  });

  // Quick Device Enquiry Form -> WhatsApp
  document.getElementById("enquiryForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("enqName").value.trim();
    const device = document.getElementById("enqDevice").value.trim();
    const msg = document.getElementById("enqMessage").value.trim();

    const text = [
      `*DEVICE ENQUIRY — ${STORE_CONFIG.storeName.toUpperCase()}*`,
      `• Name: ${name}`,
      `• Device / Trade-In: ${device}`,
      msg ? `• Notes: ${msg}` : null
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  });
});
