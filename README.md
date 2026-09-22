# FIAS — Consulta de Bienes v8

Plataforma de consulta patrimonial mediante GitHub Pages con **Excel institucional como fuente oficial**, JSON sincronizado para consultas rápidas y fotografías locales optimizadas para navegación pública.

## Arquitectura

- **Fuente oficial:** `INVENTARIO FIAS INSTITUCIONAL VFD.xlsx` en OneDrive/SharePoint.
- **Consulta web:** GitHub Pages.
- **Datos:** `data/assets.json`, regenerado automáticamente cuando cambia el Excel.
- **Fotografías:** `assets/bienes/*.webp`, generadas automáticamente desde la hoja `Link_fotos`.
- **Autenticación de automatización:** Microsoft Entra + OIDC + Microsoft Graph.
- **URL de consulta:** `https://jaircruz1304.github.io/Bienes-Consulta/?codigo=...`

## Fotografías

Las fotos originales pueden estar en formatos diferentes. No deben convertirse manualmente. `scripts/sync_photos.py` normaliza automáticamente JPG, PNG, WEBP, HEIC/HEIF, GIF, BMP, TIFF y formatos compatibles a WEBP optimizado.

El navegador **no accede a SharePoint para mostrar la foto**. Las imágenes se sirven desde el mismo GitHub Pages, por lo que funcionan en incógnito y sin sesión Microsoft.

## Variables existentes

No cambian:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `GRAPH_DRIVE_ID`
- `GRAPH_ITEM_ID`

## Primera puesta en marcha de v8

1. Subir el contenido del proyecto a la raíz del repositorio `Bienes-Consulta`.
2. Ir a **Actions → Sincronizar inventario → Run workflow**.
3. La primera ejecución puede tardar más porque debe copiar y convertir las fotografías existentes.
4. Verificar que aparezcan archivos `.webp` dentro de `assets/bienes/`.
5. Abrir una ficha en una ventana de incógnito y confirmar que la imagen carga sin autenticación Microsoft.

## Actualizaciones posteriores

- Cambio en Excel: revisión cada 15 minutos.
- Cambio del archivo fotográfico conservando el mismo enlace: revisión diaria mediante `Verificar fotografías`.
- Nueva foto o cambio de enlace en `Link_fotos`: se procesa con la siguiente sincronización del inventario.

## Documentación adicional

Ver `README_UI_V8.md` para detalles de formatos, manifest, caché y operación.
