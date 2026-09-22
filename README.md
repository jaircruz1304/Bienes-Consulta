# Bienes-Consulta · FIAS

Proyecto de producción para consultar bienes mediante QR en GitHub Pages, manteniendo **Excel en OneDrive/SharePoint como fuente oficial** y un **JSON sincronizado automáticamente** como capa de consulta rápida.

## Resultado

- URL de producción: `https://jaircruz1304.github.io/Bienes-Consulta/?codigo=CODIGO`
- Sin historial de movimientos.
- Sin bloque visible de “ENLACE QR”.
- Facturas, pólizas, actas y fotografías aparecen solo si tienen URL.
- Estados especiales aparecen solo si existe evidencia registrada.
- El portal consulta `data/assets.json`; nunca abre Excel durante un escaneo.
- GitHub Actions consulta el Excel cada 15 minutos y **solo regenera/publica el JSON cuando cambia el eTag del archivo**.
- También admite ejecución inmediata mediante `workflow_dispatch` o `repository_dispatch`.

Empiece por `docs/IMPLEMENTACION.md`.
