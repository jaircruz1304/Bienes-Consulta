# Bienes-Consulta UI v8 — Fotografías locales normalizadas

## Cambio principal

La página **ya no carga las fotografías de los bienes desde SharePoint en el navegador**.
SharePoint/OneDrive se conserva únicamente como fuente original para la automatización.

El flujo es:

`Excel (Link_fotos) → Microsoft Graph → GitHub Actions → conversión → assets/bienes/*.webp → GitHub Pages`

De esta forma, una persona que abre la ficha en modo incógnito, móvil o fuera de Microsoft 365 puede ver la fotografía sin iniciar sesión en SharePoint.

## Formatos originales

No es necesario uniformar manualmente las fotografías. La automatización admite archivos mezclados y normaliza a WEBP los formatos que Pillow/pillow-heif puede leer, incluyendo:

- JPG / JPEG
- PNG
- WEBP
- HEIC / HEIF
- GIF (se publica el primer fotograma)
- BMP
- TIFF
- otros formatos compatibles con los decodificadores instalados

La copia web se optimiza a un máximo de 2000 px por lado y calidad WEBP 86. El archivo original no se modifica.

## Archivos incorporados

- `scripts/sync_photos.py`: resuelve enlaces de SharePoint, detecta cambios por eTag, descarga y convierte fotografías.
- `data/photos-manifest.json`: relación técnica de fotografías sincronizadas. No almacena el enlace SharePoint en texto claro; usa un hash del enlace.
- `assets/bienes/`: fotografías WEBP utilizadas por la página.
- `.github/workflows/sync-photos.yml`: revisión diaria de cambios en los archivos originales.

## Sincronización

### Cuando cambia el Excel

`sync-inventory.yml`:

1. Detecta el nuevo eTag del Excel.
2. Descarga el Excel.
3. Lee `Link_fotos`.
4. Descarga únicamente fotos nuevas, faltantes o cuyo enlace haya cambiado.
5. Convierte a WEBP.
6. Genera `assets.json` con rutas locales.
7. Publica JSON + fotografías.

### Cuando cambia una foto pero no el Excel

`sync-photos.yml` se ejecuta diariamente a las **03:25 de Ecuador (08:25 UTC)** y revisa los eTag de los originales. Solo descarga y publica las fotografías cuyo archivo realmente cambió.

También puede ejecutarse manualmente desde **Actions → Verificar fotografías → Run workflow**.

## Caché

Cada fotografía tiene una versión derivada del eTag del archivo original. La página añade esa versión a la URL local para evitar que el navegador muestre una fotografía antigua después de una actualización.

## Git

Los workflows incorporan `fetch + rebase` antes del `push`, evitando el error `non-fast-forward` cuando se modifica la interfaz mientras la sincronización está ejecutándose.

## Importante sobre privacidad

Toda fotografía guardada en `assets/bienes/` queda accesible públicamente desde GitHub Pages. Solo deben sincronizarse fotografías autorizadas para consulta pública y que no contengan información personal, placas/documentos u otros datos cuya publicación no corresponda.
