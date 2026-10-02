(() => {
  const installBtn = document.getElementById('installBtn');
  let deferredPrompt = null;

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

  function hideInstall() {
    if (installBtn) installBtn.hidden = true;
  }

  function showInstall() {
    if (installBtn && !isStandalone()) installBtn.hidden = false;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.warn('No se pudo registrar el service worker:', err);
      });
    });
  }

  if (isStandalone()) {
    hideInstall();
    return;
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    showInstall();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideInstall();
  });

  if (isIOS()) showInstall();

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        hideInstall();
        return;
      }

      if (isIOS()) {
        alert('Para instalar Bienes FIAS en iPhone/iPad: abra el menú Compartir del navegador y seleccione “Añadir a pantalla de inicio”. La aplicación se abrirá después en modo independiente.');
        return;
      }

      alert('Si el navegador no muestra el instalador automático, abra su menú y elija “Instalar aplicación” o “Instalar Bienes FIAS”.');
    });
  }
})();
