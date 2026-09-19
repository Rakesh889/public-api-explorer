const API="https://api.publicapis.org";
const state={all:[],category:"",search:"",auth:"",https:"",cors:"",favorites:new Set(JSON.parse(localStorage.getItem("apiExplorerFavorites")||"[]"))};

const $=s=>document.querySelector(s);
const grid=$("#grid"), status=$("#status"), count=$("#resultCount");

function esc(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function saveFav(){localStorage.setItem("apiExplorerFavorites",JSON.stringify([...state.favorites]))}

async function getJSON(path){
  const r=await fetch(API+path);
  if(!r.ok) throw new Error(`Request failed (${r.status})`);
  return r.json();
}
async function init(){
  try{
    const [entries,cats]=await Promise.all([getJSON("/entries"),getJSON("/categories")]);
    state.all=entries.entries||[];
    renderChips(cats.categories||[]);
    render();
    status.textContent="Live catalog loaded. Select an API to inspect it.";
  }catch(e){
    status.innerHTML=`Could not load the catalog. <button class="ghost-btn" onclick="location.reload()">Retry</button>`;
    console.error(e);
  }
}
function renderChips(cats){
  const top=cats.slice(0,18);
  $("#categoryChips").innerHTML=`<button class="chip active" data-cat="">All</button>`+
    top.map(c=>`<button class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  document.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{
    state.category=b.dataset.cat;
    document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); render();
  });
}
function filtered(){
  const q=state.search.toLowerCase();
  return state.all.filter(a=>{
    const text=`${a.API||""} ${a.Description||""} ${a.Category||""}`.toLowerCase();
    return (!q||text.includes(q)) &&
      (!state.category||a.Category===state.category) &&
      (!state.auth||((a.Auth||"No")===state.auth)) &&
      (!state.https||(state.https==="yes"?a.HTTPS===true:a.HTTPS===false)) &&
      (!state.cors||String(a.Cors||"unknown").toLowerCase()===state.cors);
  });
}
function render(){
  const items=filtered();
  count.textContent=items.length;
  grid.innerHTML="";
  if(!items.length){grid.innerHTML=`<div class="status">No APIs match these filters.</div>`;return}
  const frag=document.createDocumentFragment();
  items.slice(0,120).forEach(a=>{
    const t=$("#cardTemplate").content.cloneNode(true), card=t.querySelector(".card");
    t.querySelector(".api-name").textContent=a.API||"Unnamed API";
    t.querySelector(".api-desc").textContent=a.Description||"No description available.";
    t.querySelector(".docs").href=a.Link||"#";
    t.querySelector(".badges").innerHTML=[
      `<span class="badge">${esc(a.Category||"Other")}</span>`,
      `<span class="badge">${esc(a.Auth||"No auth")}</span>`,
      `<span class="badge ${a.HTTPS?"good":""}">${a.HTTPS?"HTTPS":"HTTP"}</span>`,
      `<span class="badge">${esc(a.Cors||"unknown")} CORS</span>`
    ].join("");
    const fav=t.querySelector(".fav");
    const key=a.API||a.Link;
    fav.classList.toggle("active",state.favorites.has(key)); fav.textContent=state.favorites.has(key)?"★":"☆";
    fav.onclick=()=>{state.favorites.has(key)?state.favorites.delete(key):state.favorites.add(key);saveFav();render()};
    t.querySelector(".details").onclick=()=>openDetails(a);
    frag.appendChild(t);
  });
  grid.appendChild(frag);
  if(items.length>120) status.textContent=`Showing first 120 of ${items.length} matches. Refine your search to narrow it down.`;
}
function openDetails(a){
  $("#modalBody").innerHTML=`
    <span class="eyebrow">${esc(a.Category||"API")}</span>
    <h2>${esc(a.API||"Unnamed API")}</h2>
    <p class="muted">${esc(a.Description||"No description available.")}</p>
    <div class="detail-grid">
      <div class="detail-box"><small>Authentication</small><b>${esc(a.Auth||"None")}</b></div>
      <div class="detail-box"><small>HTTPS</small><b>${a.HTTPS?"Supported":"Not supported"}</b></div>
      <div class="detail-box"><small>CORS</small><b>${esc(a.Cors||"Unknown")}</b></div>
      <div class="detail-box"><small>Category</small><b>${esc(a.Category||"—")}</b></div>
    </div>
    <p><b>API URL</b></p><p class="detail-url">${esc(a.Link||"—")}</p>
    <p><a class="primary" href="${esc(a.Link||"#")}" target="_blank" rel="noopener">Open API website ↗</a></p>
    <details><summary>Raw catalog record</summary><pre class="json">${esc(JSON.stringify(a,null,2))}</pre></details>`;
  $("#modal").classList.remove("hidden"); $("#modal").setAttribute("aria-hidden","false");
}
$("#closeModal").onclick=()=>$("#modal").classList.add("hidden");
$("#modal").onclick=e=>{if(e.target.id==="modal")$("#modal").classList.add("hidden")};
$("#searchInput").oninput=e=>{state.search=e.target.value;render()};
$("#clearSearch").onclick=()=>{$("#searchInput").value="";state.search="";render()};
$("#authFilter").onchange=e=>{state.auth=e.target.value;render()};
$("#httpsFilter").onchange=e=>{state.https=e.target.value;render()};
$("#corsFilter").onchange=e=>{state.cors=e.target.value;render()};
$("#randomBtn").onclick=async()=>{
  try{const a=(await getJSON("/random")).entries?.[0]; if(a)openDetails(a)}
  catch(e){status.textContent="Random API request failed."}
};
init();