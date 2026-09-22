(() => {
  const C = window.BIENES_CONFIG;
  const $ = id => document.getElementById(id);
  let payload = {meta:{},assets:[]};

  const clean = v => (v === null || v === undefined || v === '' || /^N\/?A$/i.test(String(v).trim())) ? null : v;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
  const isUrl = s => /^https?:\/\//i.test(String(s ?? '').trim());
  const show = (el,on=true) => el.hidden = !on;
  const val = v => clean(v) ?? 'No registrado';
  const money = v => { const n=Number(v); return Number.isFinite(n) ? new Intl.NumberFormat('es-EC',{style:'currency',currency:'USD'}).format(n) : val(v); };
  const fmtDate = v => {
    if (!clean(v)) return null;
    const s=String(v);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
    const d=new Date(s.length===10 ? `${s}T00:00:00` : s);
    return Number.isNaN(d.getTime()) ? s : new Intl.DateTimeFormat('es-EC',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
  };
  const permanent = code => `${C.baseUrl}?codigo=${encodeURIComponent(code)}`;

  async function load(){
    const join=C.dataUrl.includes('?')?'&':'?';
    const r=await fetch(`${C.dataUrl}${join}v=${Date.now()}`,{cache:'no-store'});
    if(!r.ok) throw new Error(`Error ${r.status} al cargar la base de consulta.`);
    const data=await r.json();
    payload=Array.isArray(data)?{meta:{},assets:data}:data;
    if(!Array.isArray(payload.assets)) throw new Error('La estructura de assets.json no es válida.');
  }

  function field(label,value,type='text',wide=false){
    if(!clean(value)) return '';
    let out=esc(value);
    if(type==='money') out=esc(money(value));
    if(type==='date') out=esc(fmtDate(value));
    return `<div class="field${wide?' wide':''}"><span>${esc(label)}</span><strong>${out}</strong></div>`;
  }
  function section(title,kicker,fields){
    const body=fields.filter(Boolean).join('');
    if(!body) return '';
    return `<section class="panel section"><div class="section-title"><div><p class="eyebrow">${esc(kicker)}</p><h3>${esc(title)}</h3></div></div><div class="field-grid">${body}</div></section>`;
  }

  function renderStatuses(a){
    const statuses=Array.isArray(a.estados_especiales)?a.estados_especiales:[];
    const box=$('specialStatuses');
    if(!statuses.length){show(box,false);box.innerHTML='';return;}
    box.innerHTML=statuses.map(s=>`<span class="status ${esc(s.nivel||'informativo')}">${esc(s.etiqueta||s.codigo)}</span>`).join('');
    show(box,true);
  }

  function renderPhoto(a){
    const box=$('photo'), link=$('photoLink');
    box.innerHTML='<div class="photo-placeholder"><span>FIAS</span><small>Activo institucional</small></div>';
    const url=a.foto_url || (a.documentos||[]).find(d=>norm(d.tipo)==='FOTOGRAFIA')?.url;
    show(link,!!isUrl(url)); if(isUrl(url)) link.href=url;
    if(!isUrl(url)) return;
    const img=new Image();
    img.alt=`Fotografía de ${a.codigo}`;
    img.onload=()=>{box.innerHTML='';box.appendChild(img)};
    img.onerror=()=>{};
    img.referrerPolicy='no-referrer';
    img.src=url + (url.includes('?')?'&':'?') + 'download=1';
  }

  function renderDocs(a){
    const docs=(a.documentos||[]).filter(d=>isUrl(d.url));
    const panel=$('docsPanel'), box=$('documents');
    if(!docs.length){show(panel,false);box.innerHTML='';return;}
    const order={FACTURA:1,POLIZA:2,ACTA_ENTREGA:3,ACTA_CUSTODIA:4,GARANTIA:5,FOTOGRAFIA:8,OTRO:9};
    docs.sort((x,y)=>(order[norm(x.tipo)]||50)-(order[norm(y.tipo)]||50));
    const labels={FACTURA:'FACTURA',POLIZA:'PÓLIZA',ACTA_ENTREGA:'ACTA DE ENTREGA',ACTA_CUSTODIA:'ACTA DE CUSTODIA',GARANTIA:'GARANTÍA',FOTOGRAFIA:'FOTOGRAFÍA',OTRO:'DOCUMENTO'};
    box.innerHTML=docs.map(d=>`<article class="doc"><span class="doc-type">${esc(labels[norm(d.tipo)]||d.tipo||'DOCUMENTO')}</span><strong>${esc(d.nombre||'Documento de respaldo')}</strong><a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">Abrir documento →</a></article>`).join('');
    show(panel,true);
  }

  function render(a){
    show($('notFound'),false);show($('asset'),true);show($('printBtn'),true);
    $('assetCode').textContent=a.codigo;
    $('assetName').textContent=a.descripcion||'Bien institucional';
    $('assetExtra').textContent=a.descripcion_adicional||'';
    $('assetCustodian').textContent=val(a.custodio);
    show($('quickCustodian'), C.showCustodian !== false);
    $('assetLocation').textContent=val(a.ubicacion);
    $('assetBrandModel').textContent=[clean(a.marca),clean(a.modelo)].filter(Boolean).join(' / ')||'No registrado';
    $('assetPhysical').textContent=val(a.estado_fisico);
    renderStatuses(a);renderPhoto(a);renderDocs(a);

    const d=[];
    d.push(section('Identificación','ACTIVO',[
      field('Tipo de bien',a.tipo_bien),field('Clasificación',a.clasificacion),field('Proyecto',a.proyecto),
      field('Cantidad',a.cantidad),field('Marca',a.marca),field('Modelo',a.modelo),field('Número de serie',a.serie),field('Institución',a.institucion)
    ]));
    d.push(section('Adquisición','ORIGEN',[
      field('Fecha de compra',a.fecha_compra,'date'),field('Donante',a.donante),field('Proveedor',a.proveedor),
      field('N.° factura / acta',a.numero_factura), C.showFinancialValues!==false?field('Valor de adquisición',a.valor_adquisicion,'money'):''
    ]));
    d.push(section('Seguro y garantía','COBERTURA',[
      field('Asegurado',a.asegurado),field('Aseguradora',a.aseguradora),field('N.° póliza',a.poliza),
      field('Inicio seguro',a.inicio_seguro,'date'),field('Fin seguro',a.fin_seguro,'date'),field('Garantía técnica',a.garantia),
      field('Inicio garantía',a.inicio_garantia,'date'),field('Fin garantía',a.fin_garantia,'date'),field('Estado garantía',a.estado_garantia)
    ]));
    d.push(section('Condición del bien','ESTADO',[
      field('Vida útil estimada',a.vida_util),field('Fecha de baja',a.fecha_baja,'date'),field('Motivo de baja',a.motivo_baja),
      field('Observaciones',a.observaciones,'text',true)
    ]));
    $('details').innerHTML=d.filter(Boolean).join('');
    const u=new URL(location.href);u.searchParams.set('codigo',a.codigo);history.replaceState({},'',u);
  }

  function find(code){const k=norm(code);return payload.assets.find(a=>norm(a.codigo)===k)||null}
  function open(code){const a=find(code);if(!a){show($('asset'),false);show($('notFound'),true);return}render(a)}
  function search(q){const n=norm(q);if(n.length<2)return[];return payload.assets.filter(a=>[a.codigo,a.descripcion,a.descripcion_adicional,a.custodio,a.ubicacion,a.serie,a.marca,a.modelo].some(v=>norm(v).includes(n))).slice(0,C.maxSuggestions||8)}
  function suggestions(q){
    const box=$('suggestions'),hits=search(q);if(!hits.length){show(box,false);return}
    box.innerHTML=hits.map(a=>`<button type="button" class="suggestion" data-code="${esc(a.codigo)}"><span><b>${esc(a.codigo)}</b><small>${esc(a.descripcion||'')}</small></span><em>${esc(a.ubicacion||a.custodio||'')}</em></button>`).join('');
    box.querySelectorAll('.suggestion').forEach(b=>b.onclick=()=>{$('searchInput').value=b.dataset.code;show(box,false);open(b.dataset.code)});show(box,true);
  }
  function renderFreshness(){
    const m=payload.meta||{}, raw=m.sourceLastModified||m.generatedAt;if(!raw)return;
    const d=new Date(raw);if(Number.isNaN(d.getTime()))return;
    $('freshness').textContent=`Actualizado ${new Intl.DateTimeFormat('es-EC',{dateStyle:'medium',timeStyle:'short'}).format(d)}`;show($('freshness'),true);
  }

  $('searchForm').addEventListener('submit',e=>{e.preventDefault();show($('suggestions'),false);open($('searchInput').value)});
  $('searchInput').addEventListener('input',e=>suggestions(e.target.value));
  $('copyBtn').addEventListener('click',async()=>{const code=$('assetCode').textContent;await navigator.clipboard.writeText(permanent(code));const b=$('copyBtn'),old=b.textContent;b.textContent='Enlace copiado';setTimeout(()=>b.textContent=old,1300)});
  $('printBtn').addEventListener('click',()=>window.print());

  (async()=>{try{await load();show($('loading'),false);renderFreshness();const code=new URLSearchParams(location.search).get('codigo');if(code){$('searchInput').value=code;open(code)}}catch(e){console.error(e);show($('loading'),false);show($('error'),true);$('errorText').textContent=e.message||'Error al cargar la base.'}})();
})();
