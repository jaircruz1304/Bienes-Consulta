(() => {
  const C = window.BIENES_CONFIG || {};
  const $ = id => document.getElementById(id);

  const state = {
    stream: null,
    devices: [],
    cameraIndex: 0,
    detector: null,
    qrTimer: null,
    scanningQr: false,
    lastQrCheck: 0,
    previewObjectUrl: null,
    ocrWorker: null,
    ocrBusy: false,
    jsQrLoading: null,
    tesseractLoading: null,
    lastResolved: null,
  };

  const norm = s => String(s ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase().replace(/\s+/g, ' ').trim();

  const compact = s => norm(s).replace(/[^A-Z0-9]/g, '');
  const visualFold = s => compact(s).replace(/O/g, '0').replace(/[IL]/g, '1').replace(/S/g, '5');
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function app() {
    return window.BIENES_APP || null;
  }

  function assets() {
    return app()?.getAssets?.() || [];
  }

  function setStatus(message, kind = '') {
    const el = $('scannerStatus');
    if (!el) return;
    el.className = `scanner-status${kind ? ` ${kind}` : ''}`;
    el.textContent = message;
  }

  function setProgress(value = 0, text = '') {
    const wrap = $('scannerProgress');
    const bar = $('scannerProgressBar');
    const label = $('scannerProgressText');
    if (value === null) {
      wrap.hidden = true;
      bar.style.width = '0%';
      return;
    }
    wrap.hidden = false;
    const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
    bar.style.width = `${pct}%`;
    label.textContent = text || `Procesando ${pct}%`;
  }

  function setBusy(busy) {
    $('ocrBtn').disabled = busy;
    $('switchCameraBtn').disabled = busy;
    $('scanFileInput').disabled = busy;
  }

  function levenshtein(a, b, max = Infinity) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      let rowMin = cur[0];
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        const v = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
        cur[j] = v;
        rowMin = Math.min(rowMin, v);
      }
      if (rowMin > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }

  function exactCodeMatch(text) {
    const haystack = compact(text);
    const folded = visualFold(text);
    const ordered = assets()
      .filter(a => a && a.codigo)
      .map(a => ({ asset: a, code: compact(a.codigo), folded: visualFold(a.codigo) }))
      .filter(x => x.code.length >= 5)
      .sort((a, b) => b.code.length - a.code.length);

    for (const item of ordered) {
      if (haystack.includes(item.code)) return { asset: item.asset, confidence: 1, method: 'Código exacto' };
    }
    for (const item of ordered) {
      if (folded.includes(item.folded)) return { asset: item.asset, confidence: .97, method: 'Código normalizado' };
    }
    return null;
  }

  function fuzzyCodeMatch(text) {
    const haystack = visualFold(text);
    if (haystack.length < 5) return null;
    let best = null;
    for (const asset of assets()) {
      if (!asset?.codigo) continue;
      const code = visualFold(asset.codigo);
      const L = code.length;
      if (L < 6 || haystack.length < Math.max(4, L - 2)) continue;
      const maxDist = L >= 12 ? 2 : 1;
      const minLen = Math.max(4, L - maxDist);
      const maxLen = Math.min(haystack.length, L + maxDist);
      for (let len = minLen; len <= maxLen; len++) {
        for (let i = 0; i <= haystack.length - len; i++) {
          const segment = haystack.slice(i, i + len);
          const d = levenshtein(segment, code, maxDist);
          if (d <= maxDist) {
            const confidence = 1 - d / Math.max(L, len);
            if (!best || confidence > best.confidence) {
              best = { asset, confidence, method: `Código aproximado (${d} diferencia${d === 1 ? '' : 's'})` };
            }
          }
        }
      }
    }
    return best;
  }

  const stopWords = new Set(['DEL','DE','LA','EL','LOS','LAS','UN','UNA','PARA','CON','FIAS','FONDO','INVERSION','AMBIENTAL','SOSTENIBLE','MINISTERIO','ECUADOR']);
  function words(s) {
    return norm(s).split(/[^A-Z0-9]+/).filter(x => x.length >= 3 && !stopWords.has(x));
  }

  function descriptiveCandidates(text) {
    const ocrWords = new Set(words(text));
    const rawCompact = compact(text);
    const ranked = [];
    for (const asset of assets()) {
      const fields = [asset.descripcion, asset.descripcion_adicional, asset.serie, asset.marca, asset.modelo, asset.ubicacion].filter(Boolean);
      let score = 0;
      const reasons = [];
      if (asset.serie && compact(asset.serie).length >= 5 && rawCompact.includes(compact(asset.serie))) {
        score += 65;
        reasons.push('serie');
      }
      const assetWords = new Set(words(fields.join(' ')));
      let common = 0;
      for (const w of assetWords) if (ocrWords.has(w)) common++;
      if (common) {
        score += Math.min(30, common * 9);
        reasons.push(`${common} palabra${common === 1 ? '' : 's'}`);
      }
      if (score >= 18) ranked.push({ asset, score, reason: reasons.join(' + ') });
    }
    return ranked.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  function resolveText(text, source = 'QR') {
    const exact = exactCodeMatch(text);
    if (exact) return { primary: exact, candidates: [], source, raw: text };
    const fuzzy = fuzzyCodeMatch(text);
    if (fuzzy && fuzzy.confidence >= .86) return { primary: fuzzy, candidates: [], source, raw: text };
    return { primary: null, candidates: descriptiveCandidates(text), source, raw: text };
  }

  function renderResults(result) {
    const box = $('scannerResults');
    box.hidden = false;
    if (result.primary) {
      const a = result.primary.asset;
      box.innerHTML = `
        <div class="scan-result success">
          <span>${result.source}</span>
          <strong>${escapeHtml(a.codigo)}</strong>
          <p>${escapeHtml(a.descripcion || 'Bien institucional')}</p>
          <small>${escapeHtml(result.primary.method)} · confianza ${Math.round(result.primary.confidence * 100)}%</small>
          <button type="button" class="btn scan-open-result" data-code="${escapeHtml(a.codigo)}">Abrir ficha</button>
        </div>`;
      box.querySelector('.scan-open-result').onclick = () => openResolved(a.codigo);
      return;
    }

    if (result.candidates?.length) {
      box.innerHTML = `
        <div class="scan-result">
          <span>${result.source}</span>
          <strong>Posibles coincidencias</strong>
          <p>No se leyó un código completo. Seleccione el bien si reconoce una coincidencia.</p>
          <div class="scan-candidates">
            ${result.candidates.map(c => `<button type="button" data-code="${escapeHtml(c.asset.codigo)}"><b>${escapeHtml(c.asset.codigo)}</b><small>${escapeHtml(c.asset.descripcion || '')}</small></button>`).join('')}
          </div>
        </div>`;
      box.querySelectorAll('.scan-candidates button').forEach(btn => btn.onclick = () => openResolved(btn.dataset.code));
      return;
    }

    const preview = String(result.raw || '').trim().slice(0, 260);
    box.innerHTML = `
      <div class="scan-result warning">
        <span>${result.source}</span>
        <strong>No se identificó un bien</strong>
        <p>${preview ? `Contenido detectado: “${escapeHtml(preview)}”` : 'No se obtuvo texto utilizable.'}</p>
        <small>Intente acercar la cámara, mejorar la iluminación o usar una fotografía.</small>
      </div>`;
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function openResolved(code) {
    const ok = app()?.openByCode?.(code);
    if (ok) {
      closeScanner();
      setTimeout(() => $('asset')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }

  async function handleDecodedText(text, source) {
    if (!text || state.lastResolved === `${source}:${text}`) return false;
    state.lastResolved = `${source}:${text}`;
    const result = resolveText(text, source);
    renderResults(result);
    if (result.primary && result.primary.confidence >= .90) {
      setStatus(`${source} leído: ${result.primary.asset.codigo}. Abriendo ficha…`, 'ok');
      await sleep(450);
      openResolved(result.primary.asset.codigo);
      return true;
    }
    setStatus(result.candidates.length ? 'Lectura realizada. Revise las posibles coincidencias.' : 'Lectura realizada, pero no se identificó un código conocido.', result.candidates.length ? 'ok' : 'warn');
    return false;
  }

  function loadScript(src, globalName) {
    if (globalName && window[globalName]) return Promise.resolve(window[globalName]);
    return new Promise((resolve, reject) => {
      const existing = [...document.scripts].find(s => s.src === src);
      if (existing) {
        existing.addEventListener('load', () => resolve(globalName ? window[globalName] : true), { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.onload = () => resolve(globalName ? window[globalName] : true);
      s.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.head.appendChild(s);
    });
  }

  async function ensureJsQR() {
    if (window.jsQR) return window.jsQR;
    if (!state.jsQrLoading) {
      const src = C.scanner?.jsQrUrl || 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
      state.jsQrLoading = loadScript(src, 'jsQR');
    }
    return state.jsQrLoading;
  }

  async function ensureTesseract() {
    if (window.Tesseract) return window.Tesseract;
    if (!state.tesseractLoading) {
      const src = C.scanner?.tesseractUrl || 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      state.tesseractLoading = loadScript(src, 'Tesseract');
    }
    return state.tesseractLoading;
  }

  async function prepareBarcodeDetector() {
    state.detector = null;
    if (!('BarcodeDetector' in window)) return;
    try {
      const formats = await BarcodeDetector.getSupportedFormats();
      if (formats.includes('qr_code')) state.detector = new BarcodeDetector({ formats: ['qr_code'] });
    } catch (e) {
      console.warn('BarcodeDetector no disponible:', e);
    }
  }

  function sourceDimensions(source) {
    if (source instanceof HTMLVideoElement) return { width: source.videoWidth, height: source.videoHeight };
    if (source instanceof HTMLImageElement) return { width: source.naturalWidth, height: source.naturalHeight };
    return { width: source.width || 0, height: source.height || 0 };
  }

  function sourceCanvas(source, maxWidth = 1200, preprocess = false) {
    const { width, height } = sourceDimensions(source);
    if (!width || !height) throw new Error('La imagen todavía no está lista.');
    const scale = Math.min(1, maxWidth / width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    if (preprocess) {
      const im = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = im.data;
      for (let i = 0; i < d.length; i += 4) {
        let g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        g = Math.max(0, Math.min(255, (g - 128) * 1.55 + 128));
        d[i] = d[i + 1] = d[i + 2] = g;
      }
      ctx.putImageData(im, 0, 0);
    }
    return canvas;
  }

  async function detectQr(source, allowFallback = true) {
    if (state.detector) {
      try {
        const hits = await state.detector.detect(source);
        if (hits?.length && hits[0].rawValue) return hits[0].rawValue;
      } catch (e) {
        // Continúa con jsQR si la implementación nativa falla con el frame actual.
      }
    }
    if (!allowFallback) return null;
    try {
      const jsQR = await ensureJsQR();
      const canvas = sourceCanvas(source, 1100, false);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const im = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hit = jsQR(im.data, im.width, im.height, { inversionAttempts: 'attemptBoth' });
      return hit?.data || null;
    } catch (e) {
      console.warn('Fallback QR no disponible:', e);
      return null;
    }
  }

  async function qrLoop(ts = 0) {
    if (!$('scannerModal') || $('scannerModal').hidden || !state.stream) return;
    if (!state.scanningQr && $('scannerVideo').readyState >= 2 && ts - state.lastQrCheck > 330) {
      state.scanningQr = true;
      state.lastQrCheck = ts;
      try {
        const useFallback = !state.detector || (Math.floor(ts / 330) % 5 === 0);
        const text = await detectQr($('scannerVideo'), useFallback);
        if (text) {
          const opened = await handleDecodedText(text, 'QR');
          if (opened) return;
        }
      } finally {
        state.scanningQr = false;
      }
    }
    state.qrTimer = requestAnimationFrame(qrLoop);
  }

  async function enumerateCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      state.devices = devices.filter(d => d.kind === 'videoinput');
      $('switchCameraBtn').hidden = state.devices.length < 2;
    } catch {
      state.devices = [];
      $('switchCameraBtn').hidden = true;
    }
  }

  async function startCamera(deviceId = null) {
    stopCamera();
    $('scannerPreview').hidden = true;
    $('scannerVideo').hidden = false;
    state.lastResolved = null;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('Este navegador no permite acceso directo a la cámara. Utilice “Usar foto”.', 'warn');
      return false;
    }
    try {
      const video = deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        : { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } };
      state.stream = await navigator.mediaDevices.getUserMedia({ audio: false, video });
      $('scannerVideo').srcObject = state.stream;
      await $('scannerVideo').play();
      await enumerateCameras();
      setStatus('Buscando código QR… Si la etiqueta no tiene QR, pulse “Leer texto (OCR)”.');
      state.qrTimer = requestAnimationFrame(qrLoop);
      return true;
    } catch (e) {
      console.error(e);
      const denied = e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError';
      setStatus(denied ? 'No se concedió permiso para usar la cámara. Puede habilitarlo en el navegador o utilizar “Usar foto”.' : 'No fue posible iniciar la cámara. Utilice “Usar foto”.', 'warn');
      return false;
    }
  }

  function stopCamera() {
    if (state.qrTimer) cancelAnimationFrame(state.qrTimer);
    state.qrTimer = null;
    if (state.stream) state.stream.getTracks().forEach(t => t.stop());
    state.stream = null;
    if ($('scannerVideo')) $('scannerVideo').srcObject = null;
  }

  async function switchCamera() {
    if (state.devices.length < 2) return;
    state.cameraIndex = (state.cameraIndex + 1) % state.devices.length;
    setStatus('Cambiando cámara…');
    await startCamera(state.devices[state.cameraIndex].deviceId);
  }

  async function getOcrWorker() {
    if (state.ocrWorker) return state.ocrWorker;
    const Tesseract = await ensureTesseract();
    setProgress(.02, 'Cargando motor OCR por primera vez…');
    const lang = C.scanner?.ocrLanguage || 'spa';
    state.ocrWorker = await Tesseract.createWorker(lang, 1, {
      logger: m => {
        if (m.status === 'recognizing text') setProgress(m.progress || 0, `Leyendo etiqueta… ${Math.round((m.progress || 0) * 100)}%`);
        else if (m.status) setProgress(Math.max(.03, m.progress || 0), 'Preparando reconocimiento de texto…');
      }
    });
    return state.ocrWorker;
  }

  async function runOcr() {
    if (state.ocrBusy) return;
    const source = !$('scannerPreview').hidden ? $('scannerPreview') : $('scannerVideo');
    const dims = sourceDimensions(source);
    if (!dims.width) {
      setStatus('No hay una imagen disponible para analizar.', 'warn');
      return;
    }
    state.ocrBusy = true;
    setBusy(true);
    setStatus('Capturando y preparando la etiqueta para OCR…');
    $('scannerResults').hidden = true;
    try {
      const canvas = sourceCanvas(source, C.scanner?.ocrMaxWidth || 1800, true);
      const worker = await getOcrWorker();
      setProgress(.1, 'Leyendo texto de la etiqueta…');
      const result = await worker.recognize(canvas, { rotateAuto: true });
      const text = result?.data?.text || '';
      setProgress(1, 'Lectura terminada');
      await handleDecodedText(text, 'OCR');
    } catch (e) {
      console.error(e);
      setStatus('No fue posible completar el OCR. Intente con una foto más cercana y bien iluminada.', 'warn');
    } finally {
      state.ocrBusy = false;
      setBusy(false);
      setTimeout(() => setProgress(null), 900);
    }
  }

  async function loadImageFile(file) {
    if (!file) return;
    stopCamera();
    if (state.previewObjectUrl) URL.revokeObjectURL(state.previewObjectUrl);
    state.previewObjectUrl = URL.createObjectURL(file);
    const img = $('scannerPreview');
    img.src = state.previewObjectUrl;
    img.hidden = false;
    $('scannerVideo').hidden = true;
    state.lastResolved = null;
    setStatus('Analizando la fotografía para localizar un QR…');
    await img.decode();
    const qr = await detectQr(img, true);
    if (qr) {
      const opened = await handleDecodedText(qr, 'QR');
      if (opened) return;
    } else {
      setStatus('No se detectó un QR legible. Pulse “Leer texto (OCR)” para reconocer la etiqueta.', 'warn');
    }
  }

  async function openScanner() {
    const modal = $('scannerModal');
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('scanner-open');
    $('scannerResults').hidden = true;
    $('scannerResults').innerHTML = '';
    setProgress(null);
    state.lastResolved = null;
    if (!assets().length) setStatus('El inventario todavía está cargando. Espere unos segundos.', 'warn');
    await prepareBarcodeDetector();
    await startCamera();
  }

  function closeScanner() {
    const modal = $('scannerModal');
    if (!modal) return;
    stopCamera();
    modal.hidden = true;
    document.body.classList.remove('scanner-open');
    $('scanFileInput').value = '';
    if (state.previewObjectUrl) {
      URL.revokeObjectURL(state.previewObjectUrl);
      state.previewObjectUrl = null;
    }
  }

  $('scannerBtn')?.addEventListener('click', openScanner);
  $('scannerClose')?.addEventListener('click', closeScanner);
  document.querySelector('[data-scanner-close]')?.addEventListener('click', closeScanner);
  $('ocrBtn')?.addEventListener('click', runOcr);
  $('switchCameraBtn')?.addEventListener('click', switchCamera);
  $('scanFileInput')?.addEventListener('change', e => loadImageFile(e.target.files?.[0]));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('scannerModal')?.hidden) closeScanner(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && !$('scannerModal')?.hidden) stopCamera(); });
})();
