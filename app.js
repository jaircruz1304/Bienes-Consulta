const CONFIG = window.FIAS_CONFIG || {};
let ASSETS = [];

const $ = (id) => document.getElementById(id);
const norm = (v) => String(v ?? "").trim();
const show = (el, value=true) => el.hidden = !value;
const fmt = (v) => (v === null || v === undefined || v === "" ? "No registrado" : String(v));
const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const isUrl = (v) => /^https?:\/\//i.test(norm(v));
const money = (v) => {
  if (v === null || v === undefined || v === "") return "No registrado";
  const n = Number(v);
  return Number.isFinite(n) ? new Intl.NumberFormat("es-EC",{style:"currency",currency:"USD"}).format(n) : String(v);
};

async function loadAssets(){
  const r = await fetch(CONFIG.dataUrl, {cache:"no-store"});
  if(!r.ok) throw new Error(`No se pudo cargar la base (${r.status})`);
  ASSETS = await r.json();
}

function permalink(code){
  const base = CONFIG.baseUrl || `${location.origin}${location.pathname}`;
  return `${base}?codigo=${encodeURIComponent(code)}`;
}

function field(label, value, type="text"){
  if(value === null || value === undefined || value === "") return "";
  let body = escapeHtml(value);
  if(type === "money") body = escapeHtml(money(value));
  if(type === "link" && isUrl(value)) body = `<a href="${escapeHtml(value)}" target="_blank" rel="noopener">Abrir documento</a>`;
  return `<div class="field"><span>${escapeHtml(label)}</span><strong>${body}</strong></div>`;
}

function section(title, fields){
  const content = fields.filter(Boolean).join("");
  if(!content) return "";
  return `<section class="card section-card"><h3>${escapeHtml(title)}</h3><div class="field-grid">${content}</div></section>`;
}

function statusText(a){
  if(a.fecha_baja) return "DADO DE BAJA";
  return a.estado_fisico || "REGISTRADO";
}

function render(a){
  show($("notFound"), false);
  show($("assetView"), true);
  show($("printBtn"), true);

  $("assetCode").textContent = a.codigo;
  $("assetName").textContent = a.descripcion || "Bien institucional";
  $("assetExtra").textContent = a.descripcion_adicional || "";
  $("assetCustodian").textContent = fmt(a.custodio);
  $("assetLocation").textContent = fmt(a.ubicacion);
  $("assetBrandModel").textContent = [a.marca,a.modelo].filter(Boolean).join(" / ") || "No registrado";
  $("assetSerial").textContent = fmt(a.serie);
  $("assetStatus").textContent = statusText(a);
  $("permalink").textContent = permalink(a.codigo);

  const photoBtn = $("photoBtn");
  show(photoBtn, !!a.foto_url);
  if(a.foto_url) photoBtn.href = a.foto_url;

  const photoBox = $("photoBox");
  photoBox.innerHTML = `<div class="photo-placeholder"><span>FIAS</span><small>Fotografía del bien</small></div>`;
  if(a.foto_url){
    const img = new Image();
    img.alt = `Fotografía de ${a.codigo}`;
    img.onload = () => { photoBox.innerHTML=""; photoBox.appendChild(img); };
    img.onerror = () => {};
    img.src = a.foto_url + (a.foto_url.includes("?") ? "&" : "?") + "download=1";
  }

  let html = "";
  html += section("Identificación",[
    field("Código",a.codigo), field("Descripción",a.descripcion), field("Descripción adicional",a.descripcion_adicional),
    field("Tipo de bien",a.tipo_bien), field("Clasificación",a.clasificacion), field("Proyecto",a.proyecto),
    field("Marca",a.marca), field("Modelo",a.modelo), field("Número de serie",a.serie)
  ]);
  html += section("Asignación y ubicación",[
    field("Custodio",a.custodio), field("Institución",a.institucion), field("Ubicación",a.ubicacion)
  ]);
  html += section("Adquisición",[
    field("Fecha de compra",a.fecha_compra), field("Donante",a.donante),
    field("Proveedor",a.proveedor), field("RUC proveedor",a.ruc_proveedor),
    field("N.° factura / acta",a.numero_factura), field("Valor de adquisición",a.valor_adquisicion,"money"),
    field("Factura digital",a.factura_url,"link")
  ]);
  html += section("Seguro y garantía",[
    field("Asegurado",a.asegurado), field("Inicio seguro",a.inicio_seguro), field("Fin seguro",a.fin_seguro),
    field("Aseguradora",a.aseguradora), field("N.° póliza",a.poliza),
    field("Garantía técnica",a.garantia), field("Inicio garantía",a.inicio_garantia),
    field("Fin garantía",a.fin_garantia), field("Estado garantía",a.estado_garantia)
  ]);
  html += section("Estado y vida útil",[
    field("Estado físico",a.estado_fisico), field("Vida útil estimada",a.vida_util),
    field("Depreciación anual",a.depreciacion_anual,"money"),
    field("Depreciación acumulada",a.depreciacion_acumulada,"money"),
    field("Depreciación mensual",a.depreciacion_mensual,"money"),
    field("Valor residual",a.valor_residual,"money"),
    field("Fecha de baja",a.fecha_baja), field("Motivo de baja",a.motivo_baja),
    field("Observaciones",a.observaciones)
  ]);
  html += section("Documentos y respaldo",[
    field("Fotografía",a.foto_url,"link"), field("Factura / respaldo",a.factura_url,"link")
  ]);
  $("sections").innerHTML = html;

  const u = new URL(location.href);
  u.searchParams.set("codigo", a.codigo);
  history.replaceState({}, "", u);
}

function findByCode(code){
  const n = norm(code).toUpperCase();
  return ASSETS.find(a => norm(a.codigo).toUpperCase() === n);
}

function doSearch(code){
  const a = findByCode(code);
  if(a){ render(a); return; }
  show($("assetView"), false);
  show($("printBtn"), false);
  show($("notFound"), true);
}

function updateSuggestions(q){
  q = norm(q).toLowerCase();
  const box = $("suggestions");
  if(q.length < 2){ show(box,false); return; }
  const hits = ASSETS.filter(a =>
    [a.codigo,a.descripcion,a.custodio,a.ubicacion].some(v => norm(v).toLowerCase().includes(q))
  ).slice(0,8);
  if(!hits.length){ show(box,false); return; }
  box.innerHTML = hits.map(a =>
    `<div class="suggestion" data-code="${escapeHtml(a.codigo)}"><strong>${escapeHtml(a.codigo)} · ${escapeHtml(a.descripcion||"")}</strong><span>${escapeHtml(a.ubicacion||"")} · ${escapeHtml(a.custodio||"")}</span></div>`
  ).join("");
  show(box,true);
  box.querySelectorAll(".suggestion").forEach(el => el.onclick = () => {
    $("searchInput").value = el.dataset.code;
    show(box,false);
    doSearch(el.dataset.code);
  });
}

async function main(){
  try{
    await loadAssets();
    show($("loading"), false);
    const code = new URLSearchParams(location.search).get("codigo");
    if(code){
      $("searchInput").value = code;
      doSearch(code);
    }else{
      show($("assetView"), false);
    }
  }catch(err){
    $("loading").textContent = "No fue posible cargar la base institucional. " + err.message;
    $("loading").classList.add("error");
  }
}

$("searchForm").addEventListener("submit", e => { e.preventDefault(); show($("suggestions"),false); doSearch($("searchInput").value); });
$("searchInput").addEventListener("input", e => updateSuggestions(e.target.value));
$("copyBtn").addEventListener("click", async () => {
  const a = findByCode($("assetCode").textContent);
  if(!a) return;
  await navigator.clipboard.writeText(permalink(a.codigo));
  $("copyBtn").textContent = "Enlace copiado";
  setTimeout(() => $("copyBtn").textContent = "Copiar enlace", 1400);
});
$("printBtn").addEventListener("click", () => window.print());
main();