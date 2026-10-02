# Bienes-Consulta v9 · PWA instalable

Esta carpeta conserva la lógica de la v9 y agrega únicamente la capa PWA.

## Archivos nuevos
- `manifest.webmanifest`
- `sw.js`
- `pwa.js`
- `assets/icons/icon-192.png`
- `assets/icons/icon-512.png`
- `assets/icons/icon-512-maskable.png`

## Archivos modificados
- `index.html`: manifiesto, icono iOS, metadatos PWA, botón `Instalar app` y carga de `pwa.js`.
- `styles.css`: soporte mínimo de presentación instalada.

## GitHub Pages
No se requieren cambios en Microsoft Entra, Graph, workflows, JSON ni fotografías.
Suba todo el contenido a la raíz del repositorio `Bienes-Consulta`.

## Instalación
### Android / Chrome
Cuando Chrome reconozca la PWA aparecerá `Instalar app`. También puede aparecer `Instalar aplicación` en el menú del navegador.

### Windows / Edge o Chrome
Puede aparecer el icono de instalación en la barra de direcciones o el botón `Instalar app` dentro del portal.

### iPhone / iPad
Apple no expone el `beforeinstallprompt`; use Compartir → Añadir a pantalla de inicio. Con el manifiesto configurado, la aplicación se inicia en modo standalone.

## Actualizaciones
`data/assets.json`, `data/source-meta.json` y `assets/bienes/*` usan estrategia network-first en el service worker para evitar mostrar inventario antiguo cuando existe conexión.
