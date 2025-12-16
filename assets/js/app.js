/* Japan Trip Planner - Mobile interactive skeleton (vanilla JS) */
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

const VIEWS = ["catalog","days","traffic","flights","stays","cloud"];

const state = {
  view: "days",
  day: 5
};

function setActiveTab(view){
  $$(".tab").forEach(b => b.classList.toggle("tab--active", b.dataset.view === view));
  VIEWS.forEach(v => {
    const el = $("#view-" + v);
    if (!el) return;
    el.hidden = v !== view;
  });
  state.view = view;
}

function setActiveDay(day){
  state.day = day;
  $$(".seg").forEach(b => b.classList.toggle("seg--active", Number(b.dataset.day) === day));
  loadDay(day);
}

async function fetchJson(path){
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error("Fetch failed: " + path);
  return await res.json();
}

/* ===== Modal ===== */
function openModal(title, bodyHtml){
  $("#modalTitle").textContent = title || "詳細";
  $("#modalBody").innerHTML = bodyHtml || "";
  $("#modal").hidden = false;
  document.body.style.overflow = "hidden";
}
function closeModal(){
  $("#modal").hidden = true;
  document.body.style.overflow = "";
}
function bindModal(){
  $("#modal").addEventListener("click", (e) => {
    if (e.target && e.target.dataset && e.target.dataset.close) closeModal();
  });
  document.addEventListener("keydown",(e)=>{ if(e.key==="Escape" && !$("#modal").hidden) closeModal(); });
}

/* ===== Render helpers ===== */
function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function renderLinks(links=[]){
  if (!links.length) return `<div class="small">（目前無連結）</div>`;
  return `<div class="links">${
    links.map(l => {
      const title = escapeHtml(l.title || l.label || "Link");
      const url = escapeHtml(l.url || "");
      return `
        <a class="linkItem" href="${url}" target="_blank" rel="noopener">
          <div class="linkItem__left">
            <div class="linkItem__title">${title}</div>
            <div class="linkItem__url">${url}</div>
          </div>
          <div class="small">開啟</div>
        </a>`;
    }).join("")
  }</div>`;
}

/* Flexible detail model:
   card.details may include menu/buy/reviews/tips/links/text
*/
function renderDetail(card){
  const d = card.details || {};
  const blocks = [];

  if (card.description) {
    blocks.push(`
      <div class="detailBlock">
        <div class="detailBlock__title">說明</div>
        <div class="small">${escapeHtml(card.description)}</div>
      </div>
    `);
  }

  const section = (title, items) => `
    <div class="detailBlock">
      <div class="detailBlock__title">${escapeHtml(title)}</div>
      <ul class="list">${(items||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul>
    </div>
  `;

  if (Array.isArray(d.menu) && d.menu.length) blocks.push(section("Menu", d.menu));
  if (Array.isArray(d.buy) && d.buy.length) blocks.push(section("Buy", d.buy));
  if (Array.isArray(d.reviews) && d.reviews.length) blocks.push(section("Reviews", d.reviews));
  if (Array.isArray(d.tips) && d.tips.length) blocks.push(section("Tips", d.tips));

  blocks.push(`
    <div class="detailBlock">
      <div class="detailBlock__title">官網 / 參考連結</div>
      ${renderLinks(d.links || card.links || [])}
    </div>
  `);

  return blocks.join("");
}

function renderCard(card){
  const time = escapeHtml(card.time || "");
  const title = escapeHtml(card.title || "（未命名卡片）");
  const category = escapeHtml(card.category || card.type || "");
  const status = escapeHtml(card.status || "");
  const metaLine = [time, category, status].filter(Boolean).join(" ｜ ");

  const hasDetail = !!(card.details || card.description || (card.links && card.links.length));
  const badges = [];
  if (status) badges.push(`<span class="badge badge--ok">${status}</span>`);
  if (category) badges.push(`<span class="badge">${category}</span>`);
  if (time) badges.push(`<span class="badge">${time}</span>`);

  return `
    <button class="card card--action" data-card='${escapeHtml(JSON.stringify(card))}'>
      <div class="row">
        <div class="row__left">
          <div class="card__title">${title}</div>
          <div class="card__meta">${escapeHtml(metaLine || card.subtitle || "")}</div>
          <div class="badgeRow">${badges.join("")}</div>
        </div>
        <div class="row__right">
          ${hasDetail ? `<span class="pill">詳細</span>` : ``}
        </div>
      </div>
    </button>
  `;
}

/* ===== Days ===== */
async function loadDay(day){
  const summaryEl = $("#daySummary");
  const cardsEl = $("#dayCards");
  summaryEl.textContent = "載入中…";
  cardsEl.innerHTML = "";

  try{
    const data = await fetchJson(`data/days/day${day}.json`);
    const title = data.title || `Day ${day}`;
    const date = data.date ? `（${data.date}）` : "";
    const status = data.status ? `狀態：${data.status}` : "";
    summaryEl.innerHTML = `<div class="kv"><div class="k">${escapeHtml(status)}</div><div class="v">${escapeHtml(title)} ${escapeHtml(date)}</div></div>`;

    const cards = data.cards || data.items || [];
    if (!cards.length){
      cardsEl.innerHTML = `
        <div class="card">
          <div class="card__title">此 Day 尚未載入內容</div>
          <div class="card__meta">你可以把 final JSON 覆蓋到 <code>data/days/day${day}.json</code>，並加入 <code>cards</code> 陣列；每張卡片可選擇性加入 <code>details.menu/buy/reviews/tips/links</code>。</div>
        </div>
      `;
      return;
    }

    cardsEl.innerHTML = cards.map(renderCard).join("");

  }catch(err){
    summaryEl.textContent = "載入失敗";
    cardsEl.innerHTML = `<div class="card"><div class="card__title">讀取 day${day}.json 失敗</div><div class="card__meta">${escapeHtml(err.message)}</div></div>`;
  }
}

function bindDayCards(){
  $("#dayCards").addEventListener("click",(e)=>{
    const btn = e.target.closest("[data-card]");
    if(!btn) return;
    const card = JSON.parse(btn.dataset.card);
    openModal(card.title || "詳細", renderDetail(card));
  });
}

/* ===== Other views (placeholder content) ===== */
function renderPlaceholderCard(title, meta, links=[]){
  return `
    <div class="card">
      <div class="card__title">${escapeHtml(title)}</div>
      <div class="card__meta">${escapeHtml(meta)}</div>
      ${links.length ? `<div style="margin-top:10px">${renderLinks(links)}</div>` : ``}
    </div>
  `;
}

function loadTraffic(){
  $("#trafficContent").innerHTML = [
    renderPlaceholderCard("名古屋機場 → 名古屋車站（μ-SKY）", "待貼入你整理的購票步驟、關鍵日文詞彙、以及圖片位置。"),
    renderPlaceholderCard("新幹線（名古屋 → 東京）", "SmartEX 訂位資訊與 QR code 提醒（QR 置於記事本）。"),
    renderPlaceholderCard("川越一日券", "可改為引用票券介紹頁並保留網址。", [
      {title:"東武川越一日券（Premium）", url:"https://www.tobu.co.jp/tcn/ticket/kawagoe/premium.html"}
    ]),
    renderPlaceholderCard("Skyliner → 成田機場", "可改為引用官方交通頁並保留網址。", [
      {title:"Skyliner 官方交通資訊", url:"https://www.keisei.co.jp/keisei/tetudou/skyliner/tc/traffic/skyliner.php"}
    ]),
    renderPlaceholderCard("雲端（票券/QR）", "你要求交通頁面也要有雲端跳轉。", [
      {title:"Google Drive", url: window.__CONFIG__.driveUrl}
    ])
  ].join("");
}

function loadFlights(){
  $("#flightContent").innerHTML = [
    renderPlaceholderCard("航班資訊（按鈕頁）", "待依你提供的截圖欄位顯示（航空公司、航班號、起降時間、航站等）。"),
    renderPlaceholderCard("航班詳細頁", "待補：行李、報到、登機門變更提醒、機場動線。"),
    renderPlaceholderCard("雲端（票券/QR）", "你要求航班頁面新增雲端按鈕。", [
      {title:"Google Drive", url: window.__CONFIG__.driveUrl}
    ])
  ].join("");
}

function loadStays(){
  $("#stayContent").innerHTML = [
    renderPlaceholderCard("Gold Stay Nagoya Sakae", "名古屋住宿（可補：地址、入住退房、地圖、聯絡方式）。"),
    renderPlaceholderCard("OMO5 東京大塚 by 星野集團", "東京住宿（可補：地址、交通、便利商店、洗衣等）。")
  ].join("");
}

/* ===== Navigation / Router ===== */
function bindTabs(){
  $$(".tab").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const view = btn.dataset.view;
      setActiveTab(view);
      if (view === "traffic") loadTraffic();
      if (view === "flights") loadFlights();
      if (view === "stays") loadStays();
    });
  });

  $$("[data-jump]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const view = btn.dataset.jump;
      setActiveTab(view);
      if (view === "traffic") loadTraffic();
      if (view === "flights") loadFlights();
      if (view === "stays") loadStays();
    });
  });
}

function init(){
  bindModal();
  bindTabs();

  // default day buttons
  $$(".seg").forEach(btn=>{
    btn.addEventListener("click", ()=> setActiveDay(Number(btn.dataset.day)));
  });

  bindDayCards();

  // set defaults
  setActiveTab("days");
  setActiveDay(state.day);
}

document.addEventListener("DOMContentLoaded", init);
