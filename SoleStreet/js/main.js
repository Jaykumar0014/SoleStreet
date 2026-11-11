const CART_KEY = "solestreet_cart";
const WISHLIST_KEY = "solestreet_wishlist";
const money = amount => "Rs. " + Number(amount).toLocaleString("en-PK");

function getCart(){ try{return JSON.parse(localStorage.getItem(CART_KEY)) || [];}catch(e){return [];} }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }
function updateCartCount(){ const count=getCart().reduce((sum,item)=>sum+item.qty,0); document.querySelectorAll(".cart-count").forEach(el=>el.textContent=count); }
function addToCart(id,size){
  const cart=getCart(); const existing=cart.find(item=>item.id===id && item.size===size);
  if(existing) existing.qty++; else cart.push({id,size,qty:1});
  saveCart(cart); alert("Added to your bag!");
}
function getProduct(id){return products.find(p=>p.id===Number(id));}
function productCard(p){
  const wishlist=JSON.parse(localStorage.getItem(WISHLIST_KEY)||"[]");
  return `<article class="product-card">
    <div class="product-image">${p.badge?`<span class="product-badge">${p.badge}</span>`:""}<button class="wishlist-btn ${wishlist.includes(p.id)?"saved":""}" data-wish="${p.id}" aria-label="Add to wishlist">♡</button><a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy"></a></div>
    <div class="product-info"><span class="product-category">${p.category.toUpperCase()}</span><h3>${p.name}</h3><div class="product-meta"><span class="product-price">${money(p.price)}</span><span class="product-rating">★ ${p.rating}</span></div><div class="product-actions"><a href="product.html?id=${p.id}">VIEW DETAILS</a><button data-quick-add="${p.id}">ADD TO BAG</button></div></div>
  </article>`;
}
function renderFeatured(){
  const el=document.getElementById("featured-products"); if(el) el.innerHTML=products.slice(0,4).map(productCard).join("");
}
function renderShop(){
  const grid=document.getElementById("shop-products"); if(!grid)return;
  const search=document.getElementById("search-input"); const sort=document.getElementById("sort-select");
  const selected=document.querySelector('input[name="category"]:checked');
  const category=selected?selected.value:"All"; const query=(search?.value||"").toLowerCase();
  let list=products.filter(p=>(category==="All"||p.category===category) && (p.name.toLowerCase().includes(query)||p.category.toLowerCase().includes(query)));
  if(sort?.value==="low") list.sort((a,b)=>a.price-b.price);
  if(sort?.value==="high") list.sort((a,b)=>b.price-a.price);
  if(sort?.value==="name") list.sort((a,b)=>a.name.localeCompare(b.name));
  document.getElementById("result-count").textContent=`${list.length} sneaker${list.length===1?"":"s"} found`;
  grid.innerHTML=list.length?list.map(productCard).join():`<div class="empty-state"><h3>No sneakers found</h3><p>Try another search or clear your filters.</p></div>`;
}
function renderProduct(){
  const el=document.getElementById("product-detail"); if(!el)return;
  const id=new URLSearchParams(location.search).get("id")||"1"; const p=getProduct(id);
  if(!p){el.innerHTML='<div class="empty-state"><h3>Product not found</h3><a class="btn btn-red" href="shop.html">BACK TO SHOP</a></div>';return;}
  el.innerHTML=`<div class="detail-image"><img src="${p.image}" alt="${p.name}"></div><div class="detail-copy"><span class="product-category">${p.category.toUpperCase()} / SOLESTREET</span><h1>${p.name}</h1><div class="product-rating">★ ${p.rating} / 5 · Customer favorite</div><p class="detail-price">${money(p.price)}</p><p class="detail-description">${p.description} Designed to bring comfort and confidence to your daily rotation.</p><p class="size-title">SELECT YOUR SIZE (EU)</p><div class="size-options">${[38,39,40,41,42,43,44].map(s=>`<button class="size-option" data-size="${s}">${s}</button>`).join("")}</div><p class="size-error" id="size-error"></p><button class="btn btn-red detail-add" id="detail-add">ADD TO BAG <span>↗</span></button><p class="detail-note">Demo product information. Images are loaded from Unsplash.</p></div>`;
  let selectedSize=null;
  el.querySelectorAll(".size-option").forEach(btn=>btn.addEventListener("click",()=>{selectedSize=btn.dataset.size;el.querySelectorAll(".size-option").forEach(b=>b.classList.toggle("selected",b===btn));document.getElementById("size-error").textContent="";}));
  document.getElementById("detail-add").addEventListener("click",()=>{if(!selectedSize){document.getElementById("size-error").textContent="Please select a shoe size first.";return;}addToCart(p.id,selectedSize);});
}
function renderCart(){
  const el=document.getElementById("cart-content"); if(!el)return;
  const cart=getCart();
  if(!cart.length){el.innerHTML=`<div class="empty-cart"><h2>Your bag is taking a break.</h2><p>Find something fresh for your next step.</p><a href="shop.html" class="btn btn-red">SHOP SNEAKERS ↗</a></div>`;return;}
  const subtotal=cart.reduce((sum,item)=>{const p=getProduct(item.id);return sum+(p?p.price*item.qty:0);},0);
  el.innerHTML=`<div class="cart-layout"><div class="cart-items">${cart.map(item=>{const p=getProduct(item.id);if(!p)return "";return `<div class="cart-row"><img src="${p.image}" alt="${p.name}"><div><h3>${p.name}</h3><p>Size EU ${item.size} · ${p.category}</p><div class="quantity-control"><button data-qty="${p.id}|${item.size}|-1">−</button><span>${item.qty}</span><button data-qty="${p.id}|${item.size}|1">+</button><button class="remove-btn" data-remove="${p.id}|${item.size}">REMOVE</button></div></div><span class="line-price">${money(p.price*item.qty)}</span></div>`;}).join("")}</div><aside class="summary-card"><h3>ORDER SUMMARY</h3><div class="summary-line"><span>Subtotal</span><b>${money(subtotal)}</b></div><div class="summary-line"><span>Shipping</span><b>${subtotal>=15000?"FREE":money(500)}</b></div><div class="summary-line total"><span>Total</span><b>${money(subtotal+(subtotal>=15000?0:500))}</b></div><a class="btn btn-red" href="checkout.html">CONTINUE TO CHECKOUT ↗</a><p class="detail-note">Shipping is a sample calculation for this demo.</p></aside></div>`;
}
function renderCheckout(){
  const el=document.getElementById("checkout-content");if(!el)return;
  const cart=getCart();if(!cart.length){el.innerHTML='<div class="empty-cart"><h2>Your bag is empty.</h2><p>Add a pair before checking out.</p><a href="shop.html" class="btn btn-red">SHOP SNEAKERS</a></div>';return;}
  const subtotal=cart.reduce((sum,item)=>{const p=getProduct(item.id);return sum+(p?p.price*item.qty:0);},0);const total=subtotal+(subtotal>=15000?0:500);
  el.innerHTML=`<div class="checkout-layout"><form id="checkout-form" class="form-card"><h2>DELIVERY DETAILS</h2><label>Full name<input name="name" required placeholder="Your full name"></label><label>Email address<input name="email" type="email" required placeholder="you@example.com"></label><label>Phone number<input name="phone" type="tel" required placeholder="+92 300 1234567"></label><label>Delivery address<textarea name="address" rows="3" required placeholder="House, street, city"></textarea></label><label>Payment method<select name="payment"><option>Cash on delivery (demo)</option><option>Pay at pickup (demo)</option></select></label><button class="btn btn-red" type="submit">PLACE DEMO ORDER ↗</button><p class="form-message">No real payment or order is processed.</p></form><aside class="summary-card"><h3>YOUR ORDER</h3>${cart.map(item=>{const p=getProduct(item.id);return `<div class="summary-line"><span>${p.name} × ${item.qty} (EU ${item.size})</span><b>${money(p.price*item.qty)}</b></div>`;}).join("")}<div class="summary-line"><span>Shipping</span><b>${subtotal>=15000?"FREE":money(500)}</b></div><div class="summary-line total"><span>Total</span><b>${money(total)}</b></div></aside></div>`;
  document.getElementById("checkout-form").addEventListener("submit",e=>{e.preventDefault();const name=new FormData(e.target).get("name");localStorage.removeItem(CART_KEY);updateCartCount();el.innerHTML=`<div class="order-success"><div class="success-icon">✓</div><h2>YOU'RE ALL SET, ${String(name).split(" ")[0].toUpperCase()}!</h2><p>Your demo order has been placed successfully. This is a frontend-only project, so no real order or payment was submitted.</p><a href="shop.html" class="btn btn-red">KEEP EXPLORING ↗</a></div>`;});
}
function setupEvents(){
  document.addEventListener("click",e=>{
    const quick=e.target.closest("[data-quick-add]");if(quick){const p=getProduct(quick.dataset.quickAdd);addToCart(p.id,42);}
    const wish=e.target.closest("[data-wish]");if(wish){let list=JSON.parse(localStorage.getItem(WISHLIST_KEY)||"[]");const id=Number(wish.dataset.wish);list=list.includes(id)?list.filter(x=>x!==id):[...list,id];localStorage.setItem(WISHLIST_KEY,JSON.stringify(list));wish.classList.toggle("saved");wish.textContent=wish.classList.contains("saved")?"♥":"♡";}
    const qty=e.target.closest("[data-qty]");if(qty){const [id,size,change]=qty.dataset.qty.split("|");let cart=getCart();const item=cart.find(x=>x.id===Number(id)&&x.size===size);if(item){item.qty+=Number(change);if(item.qty<=0)cart=cart.filter(x=>x!==item);saveCart(cart);renderCart();}}
    const remove=e.target.closest("[data-remove]");if(remove){const [id,size]=remove.dataset.remove.split("|");saveCart(getCart().filter(x=>!(x.id===Number(id)&&x.size===size)));renderCart();}
  });
  const search=document.getElementById("search-input");if(search)search.addEventListener("input",renderShop);
  const sort=document.getElementById("sort-select");if(sort)sort.addEventListener("change",renderShop);
  document.querySelectorAll('input[name="category"]').forEach(r=>r.addEventListener("change",renderShop));
  const clear=document.getElementById("clear-filters");if(clear)clear.addEventListener("click",()=>{document.getElementById("search-input").value="";document.querySelector('input[name="category"][value="All"]').checked=true;document.getElementById("sort-select").value="featured";renderShop();});
  const params=new URLSearchParams(location.search);const category=params.get("category");if(category){const radio=document.querySelector(`input[name="category"][value="${category}"]`);if(radio)radio.checked=true;}
  const menu=document.querySelector(".menu-toggle");if(menu)menu.addEventListener("click",()=>{const nav=document.querySelector(".main-nav");const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",open);});
  document.querySelectorAll(".newsletter-form").forEach(form=>form.addEventListener("submit",e=>{e.preventDefault();form.nextElementSibling.textContent="Thanks for subscribing! (Demo only)";form.reset();}));
  const contact=document.getElementById("contact-form");if(contact)contact.addEventListener("submit",e=>{e.preventDefault();contact.querySelector(".form-message").textContent="Thanks! Your demo message has been recorded on this page.";contact.reset();});
}
document.addEventListener("DOMContentLoaded",()=>{updateCartCount();renderFeatured();renderShop();renderProduct();renderCart();renderCheckout();setupEvents();});