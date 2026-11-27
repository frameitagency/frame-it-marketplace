(function(){
  const S = window.SITE, F = window.FI, $ = s => document.querySelector(s);
  const state = { q: "", cat: "All", sort: "featured", featOnly: false };
  let all = [];

  function mock(p){
    const i = Math.max(0, S.categories.indexOf(p.category));
    return `<div class="mock" style="--l:${22 + (i % 5) * 6}%" aria-hidden="true"><i></i><i></i><i></i><b>${F.esc(p.name)}</b><span></span><span></span></div>`;
  }
  function card(p){
    const ok = p.status === "available", tag = F.STATUS[p.status];
    return `<article class="card${ok ? "" : " off"}" data-id="${F.esc(p.id)}">
      <div class="thumb"><img src="${F.esc(p.thumbnail)}" alt="${F.esc(p.name)} website preview" loading="lazy" width="640" height="400" onerror="this.outerHTML=window.__mock('${F.esc(p.id)}')">${tag ? `<em class="tag">${tag}</em>` : ""}</div>
      <div class="cbody"><p class="cat">${F.esc(p.category)}</p><h3>${F.esc(p.name)}</h3><p>${F.esc(p.description)}</p>
      <ul>${p.features.slice(0,3).map(f => `<li>${F.esc(f)}</li>`).join("")}</ul>
      <p class="price">${F.money(p.price)}<small> ${F.esc(p.id)}</small></p>
      <div class="row"><a class="btn ghost" href="${F.previewPage(p)}" target="_blank" rel="noopener">Preview</a>
      ${ok ? `<a class="btn" href="${F.buyLink(p)}" target="_blank" rel="noopener">Buy This Website</a>` : `<span class="btn dis" aria-disabled="true">${tag}</span>`}</div></div></article>`;
  }
  window.__mock = id => mock(all.find(p => p.id === id));

  function list(){
    let r = all.filter(p => (state.cat === "All" || p.category === state.cat) && (!state.featOnly || p.featured)
      && (p.name + p.category + p.description + p.id).toLowerCase().includes(state.q.toLowerCase()));
    const s = state.sort;
    r.sort((a, b) => s === "low" ? a.price - b.price : s === "high" ? b.price - a.price
      : s === "newest" ? b.added.localeCompare(a.added) : (b.featured - a.featured) || b.added.localeCompare(a.added));
    return r;
  }
  function render(){
    const r = list();
    $("#grid").innerHTML = r.length ? r.map(card).join("") : `<div class="empty"><p>No websites match your search.</p><button class="btn ghost" id="clear">Clear filters</button></div>`;
    $("#count").textContent = r.length + (r.length === 1 ? " website" : " websites");
    document.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.cat === state.cat));
    const clr = $("#clear"); if (clr) clr.onclick = () => { Object.assign(state, { q: "", cat: "All", featOnly: false }); $("#q").value = ""; $("#feat").checked = false; render(); };
  }
  function setCat(c){ state.cat = c; render(); }

  function init(){
    const catTrack = $("#cats");
    const catPrev = document.createElement("button");
    const catNext = document.createElement("button");
    [catPrev, catNext].forEach((button, i) => {
      button.type = "button";
      button.className = "cat-arrow";
      button.setAttribute("aria-label", i === 0 ? "Previous categories" : "Next categories");
      button.textContent = i === 0 ? "←" : "→";
    });
    const catCarousel = document.createElement("div");
    catCarousel.className = "cat-carousel";
    catTrack.classList.add("cat-track");
    catTrack.setAttribute("aria-label", "Website design categories");
    catTrack.setAttribute("tabindex", "0");
    catTrack.parentNode.insertBefore(catCarousel, catTrack);
    catCarousel.append(catPrev, catTrack, catNext);
    const catStyle = document.createElement("style");
    catStyle.textContent = `
      #categories .cat-carousel{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:1rem}
      #categories .cats.cat-track{display:flex;gap:1rem;min-width:0;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none;padding:.25rem 0 1rem}
      #categories .cat-track::-webkit-scrollbar{display:none}
      #categories .cattile{flex:0 0 clamp(260px,32vw,360px);min-height:190px;align-content:space-between;flex-wrap:wrap;gap:.6rem 1rem;padding:1.35rem;border:1px solid #333;border-radius:14px;scroll-snap-align:start}
      #categories .cattile:hover{padding-left:1.35rem;transform:translateY(-3px);border-color:var(--c)}
      #categories .cattile strong{font-size:1.7rem}
      #categories .cat-arrow{width:44px;height:44px;border:1px solid #444;border-radius:50%;background:#111;color:#fff;font:500 1.2rem "Instrument Sans",sans-serif;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
      #categories .cat-arrow:hover:not(:disabled){background:var(--c);border-color:var(--c);color:#000}
      #categories .cat-arrow:disabled{opacity:.35;cursor:default}
      @media(max-width:820px){#categories .cat-carousel{gap:.6rem}#categories .cat-arrow{width:38px;height:38px}#categories .cattile{flex-basis:min(76vw,340px);min-height:170px}}
    `;
    document.head.append(catStyle);
    const updateCatArrows = () => {
      const max = catTrack.scrollWidth - catTrack.clientWidth;
      catPrev.disabled = catTrack.scrollLeft <= 2;
      catNext.disabled = max <= 2 || catTrack.scrollLeft >= max - 2;
    };
    const moveCats = direction => {
      const tile = catTrack.querySelector(".cattile");
      if (tile) catTrack.scrollBy({ left: direction * (tile.getBoundingClientRect().width + 16), behavior: "smooth" });
    };
    catPrev.onclick = () => moveCats(-1);
    catNext.onclick = () => moveCats(1);
    catTrack.addEventListener("scroll", updateCatArrows, { passive: true });
    window.addEventListener("resize", updateCatArrows);
    const catCarouselObserver = new ResizeObserver(updateCatArrows);
    catCarouselObserver.observe(catTrack);
    document.title = S.name + " | Ready-made websites for small businesses";
    document.querySelectorAll("[data-wa]").forEach(a => { a.href = F.generalLink(); a.target = "_blank"; a.rel = "noopener"; });
    $("#year").textContent = new Date().getFullYear();
    $("#loc").textContent = S.location;
    $("#email").innerHTML = S.email ? `<a href="mailto:${F.esc(S.email)}">${F.esc(S.email)}</a>` : "Available on request via WhatsApp";
    $("#social").innerHTML = Object.entries(S.social).filter(e => e[1]).map(e => `<a href="${F.esc(e[1])}" target="_blank" rel="noopener">${e[0][0].toUpperCase() + e[0].slice(1)}</a>`).join("") || "<span>Coming soon</span>";
    $("#chips").innerHTML = ["All", ...S.categories].map(c => `<button class="chip" data-cat="${F.esc(c)}" aria-pressed="false">${F.esc(c)}</button>`).join("");
    $("#chips").onclick = e => { if (e.target.dataset.cat) setCat(e.target.dataset.cat); };
    $("#q").oninput = e => { state.q = e.target.value; render(); };
    $("#sort").onchange = e => { state.sort = e.target.value; render(); };
    $("#feat").onchange = e => { state.featOnly = e.target.checked; render(); };
    const nav = $("#nav"), burger = $("#burger");
    burger.onclick = () => burger.setAttribute("aria-expanded", nav.classList.toggle("open"));
    nav.onclick = e => { if (e.target.tagName === "A") { nav.classList.remove("open"); burger.setAttribute("aria-expanded", false); } };
  }
  init();
  F.loadProducts().then(p => {
    all = p;
    $("#featured").innerHTML = p.filter(x => x.featured && x.status === "available").slice(0, 3).map(card).join("");
    $("#cats").innerHTML = S.categories.map(c => `<a class="cattile" href="#browse" data-cat="${F.esc(c)}"><strong>${F.esc(c)}</strong><span>${p.filter(x => x.category === c).length} designs</span></a>`).join("");
    $("#cats").onclick = e => { const a = e.target.closest("[data-cat]"); if (a) setCat(a.dataset.cat); };
    render();
  }).catch(() => { $("#grid").innerHTML = `<div class="empty"><p>The catalogue could not load. If you opened this file directly, run it through a web server or GitHub Pages.</p></div>`; });
})();
(function(){const links=[...document.querySelectorAll('#nav a[href^="#"]')],map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.removeAttribute('aria-current'));const a=map.get(e.target.id);if(a)a.setAttribute('aria-current','true')}}),{rootMargin:'-45% 0px -50% 0px'});
map.forEach((a,id)=>{const s=document.getElementById(id);if(s)io.observe(s)});})();
