(function(){
  const S = window.SITE;
  const money = n => "R" + Number(n).toLocaleString("en-ZA").replace(/\u00a0|\u202f/g, " ");
  const num = () => String(S.whatsappNumber).replace(/\D/g, "");
  const wa = text => "https://wa.me/" + num() + "?text=" + encodeURIComponent(text);
  const buyLink = p => wa(S.productMessage
    .replace("{name}", p.name).replace("{id}", p.id)
    .replace("{price}", money(p.price)).replace("{url}", p.previewUrl));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const previewPage = p => "preview.html?id=" + encodeURIComponent(p.id);
  const csv = t => { const r = []; let row = [], f = "", q = false;
    for (let i = 0; i < t.length; i++) { const ch = t[i];
      if (q) { if (ch === '"') { if (t[i+1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
      else if (ch === '"') q = true; else if (ch === ",") { row.push(f); f = ""; }
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && t[i+1] === "\n") i++; row.push(f); r.push(row); row = []; f = ""; }
      else f += ch; }
    if (f || row.length) { row.push(f); r.push(row); } return r; };
  const day = v => { v = String(v || "").trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; const d = new Date(v); return isNaN(d) ? "" : d.toISOString().slice(0, 10); };
  const fromSheet = text => { const rows = csv(text).filter(r => r.some(c => c.trim())); if (rows.length < 2) return [];
    const h = rows[0].map(x => x.trim().toLowerCase());
    return rows.slice(1).map(r => { const o = {}; h.forEach((k, i) => o[k] = (r[i] || "").trim()); return o; })
      .filter(o => o.id && o.name).map(o => ({ id: o.id, name: o.name, category: o.category, price: Number(String(o.price).replace(/[^\d.]/g, "")) || 0,
        description: o.description, previewUrl: o.previewurl, thumbnail: o.thumbnail, status: (o.status || "available").toLowerCase(),
        featured: /^(true|yes|1)$/i.test(o.featured), added: day(o.added), features: (o.features || "").split("|").map(s => s.trim()).filter(Boolean) })); };
  const loadProducts = () => (S.sheetCsvUrl ? fetch(S.sheetCsvUrl).then(r => { if (!r.ok) throw 0; return r.text(); }).then(fromSheet).then(p => { if (!p.length) throw 0; return p; }) : Promise.reject())
    .catch(() => fetch("products.json").then(r => { if (!r.ok) throw 0; return r.json(); }));
  const STATUS = { available: "", sold: "Sold", "coming-soon": "Coming soon" };
  window.FI = { fromSheet, money, wa, buyLink, esc, previewPage, loadProducts, STATUS, generalLink: () => wa(S.generalMessage) };
  if (typeof module !== "undefined") module.exports = window.FI;
})();
