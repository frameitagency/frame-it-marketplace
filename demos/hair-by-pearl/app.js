(() => {
  const cfg = window.HAIR_BY_PEARL_CONFIG || {};
  const waNumber = String(cfg.whatsappNumber || "27616100885").replace(/\D/g, "");
  const fallbackProducts = [
    {id:"HP001",name:"The Signature Straight",category:"Wigs",price:"",description:"A sleek straight style for a polished everyday look.",image:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=82",stock:"Enquire"},
    {id:"HP002",name:"The Soft Wave Edit",category:"Wigs",price:"",description:"Soft movement and timeless waves for an effortlessly dressed-up feel.",image:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=82",stock:"Enquire"},
    {id:"HP003",name:"Everyday Hairpiece",category:"Hairpieces",price:"",description:"An easy finishing touch when you want to switch up your look.",image:"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=82",stock:"Enquire"},
    {id:"HP004",name:"The Care Edit",category:"Hair care",price:"",description:"Your hair-care essentials, selected to support your routine.",image:"https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=82",stock:"Enquire"}
  ];
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const grid = $("#productGrid"), bag = new Map();
  let products = fallbackProducts, activeFilter = "all";
  const money = n => new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR",maximumFractionDigits:2}).format(Number(n));
  const escapeHTML = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const wa = message => "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(message);
  function parseCSV(text){
    const rows=[]; let row=[], field="", quoted=false;
    for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'&&quoted&&n==='"'){field+='"';i++;}else if(c==='"'){quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field="";}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&n==="\n")i++;row.push(field);if(row.some(v=>v.trim()))rows.push(row);row=[];field="";}else field+=c;}
    row.push(field);if(row.some(v=>v.trim()))rows.push(row);
    const headers=(rows.shift()||[]).map(v=>v.trim());
    return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]||"").trim()]))).filter(p=>p.id&&p.name);
  }
  async function loadProducts(){
    try{
      const source=cfg.sheetCsvUrl ? cfg.sheetCsvUrl : "products.csv";
      const response=await fetch(source,{cache:"no-store"});
      if(!response.ok)throw new Error("Catalogue unavailable");
      const parsed=parseCSV(await response.text());
      if(parsed.length)products=parsed;
    }catch(e){console.info("Using the built-in Hair by Pearl demo catalogue.",e.message);}
    render();
  }
  function productPrice(p){const n=Number(p.price);return p.price!==""&&Number.isFinite(n)&&n>0?money(n):"Price on request";}
  function render(){
    const query=($("#productSearch").value||"").trim().toLowerCase();
    const list=products.filter(p=>(activeFilter==="all"||p.category.toLowerCase()===activeFilter.toLowerCase())&&[p.name,p.category,p.description].join(" ").toLowerCase().includes(query));
    grid.innerHTML=list.length?list.map(p=>`<article class="product-card">
      <div class="product-image"><img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80'"><span class="product-tag">${escapeHTML(p.category)}</span><button class="quick-add" type="button" data-add="${escapeHTML(p.id)}">Add to enquiry bag +</button></div>
      <div class="product-info"><span class="product-category">${escapeHTML(p.category)}</span><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description)}</p><span class="product-price">${productPrice(p)}</span></div>
    </article>`).join(""):'<p class="no-results">No styles found. Try another search.</p>';
    $$("[data-add]",grid).forEach(btn=>btn.addEventListener("click",()=>add(btn.dataset.add)));
  }
  function add(id){bag.set(id,(bag.get(id)||0)+1);renderBag();openBag();}
  function change(id,delta){const next=(bag.get(id)||0)+delta;if(next<=0)bag.delete(id);else bag.set(id,next);renderBag();}
  function renderBag(){
    const total=[...bag.values()].reduce((a,b)=>a+b,0);$("#cartCount").textContent=total;
    const items=$("#cartItems");
    if(!total){items.innerHTML='<p class="empty-cart">Your bag is waiting for something beautiful.</p>';$("#cartTotal").textContent="Prices confirmed on enquiry";return;}
    items.innerHTML=[...bag].map(([id,qty])=>{const p=products.find(x=>x.id===id);if(!p)return"";return `<div class="cart-row"><img src="${escapeHTML(p.image)}" alt=""><div><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.category)} · ${productPrice(p)}</small><div class="qty-controls"><button type="button" data-qty="${escapeHTML(id)}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${qty}</span><button type="button" data-qty="${escapeHTML(id)}" data-delta="1" aria-label="Increase quantity">+</button></div></div><button class="remove-item" type="button" data-remove="${escapeHTML(id)}" aria-label="Remove item">×</button></div>`;}).join("");
    $$("[data-qty]",items).forEach(b=>b.addEventListener("click",()=>change(b.dataset.qty,Number(b.dataset.delta))));
    $$("[data-remove]",items).forEach(b=>b.addEventListener("click",()=>{bag.delete(b.dataset.remove);renderBag();}));
    const known=[...bag].every(([id])=>{const p=products.find(x=>x.id===id);return p&&p.price!==""&&Number(p.price)>0;});
    const sum=[...bag].reduce((n,[id,q])=>{const p=products.find(x=>x.id===id);return n+(Number(p?.price)||0)*q;},0);
    $("#cartTotal").textContent=known?"Subtotal: "+money(sum):"Final prices confirmed by Pearl on WhatsApp";
  }
  function openBag(){$("#cartPanel").classList.add("open");$("#cartPanel").setAttribute("aria-hidden","false");$("#cartOverlay").hidden=false;document.body.classList.add("cart-open");}
  function closeBag(){$("#cartPanel").classList.remove("open");$("#cartPanel").setAttribute("aria-hidden","true");$("#cartOverlay").hidden=true;document.body.classList.remove("cart-open");}
  $("#cartOpen").addEventListener("click",openBag);$("#cartClose").addEventListener("click",closeBag);$("#cartOverlay").addEventListener("click",closeBag);
  $("#checkoutForm").addEventListener("submit",e=>{
    e.preventDefault();if(!bag.size){openBag();return;}
    const form=new FormData(e.currentTarget),name=String(form.get("customerName")||"").trim(),phone=String(form.get("customerPhone")||"").trim();
    const lines=[...bag].map(([id,qty])=>{const p=products.find(x=>x.id===id);return `• ${p.name} × ${qty} — ${productPrice(p)} each`;});
    const allPriced=[...bag].every(([id])=>{const p=products.find(x=>x.id===id);return p&&p.price!==""&&Number(p.price)>0;});
    const subtotal=[...bag].reduce((n,[id,q])=>n+(Number(products.find(x=>x.id===id)?.price)||0)*q,0);
    const message=[`Hello ${cfg.businessName||"Hair by Pearl"}! I'd like to enquire about these items:`,"",...lines,"",allPriced?`Subtotal: ${money(subtotal)}`:"Please confirm current prices and availability.","",`Name: ${name}`,`Contact: ${phone}`,"","Please let me know the next steps. Thank you!"].join("\n");
    window.open(wa(message),"_blank","noopener");
  });
  $$("#filterTabs .filter").forEach(btn=>btn.addEventListener("click",()=>{activeFilter=btn.dataset.filter;$$("#filterTabs .filter").forEach(b=>b.classList.toggle("active",b===btn));render();}));
  $("#productSearch").addEventListener("input",render);
  $("#menuToggle").addEventListener("click",()=>{const nav=$("#mainNav"),open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open));});
  $$("#mainNav a").forEach(a=>a.addEventListener("click",()=>{$("#mainNav").classList.remove("open");$("#menuToggle").setAttribute("aria-expanded","false");}));
  $("#year").textContent=new Date().getFullYear();
  loadProducts();
})();