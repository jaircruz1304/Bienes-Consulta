# FIAS · Consulta Institucional de Bienes · UI v6

Versión visual simplificada y orientada a la consulta patrimonial, manteniendo la arquitectura de datos ya operativa:

**Excel oficial en OneDrive/SharePoint → GitHub Actions → assets.json → GitHub Pages**

## Criterio visual
La identidad FIAS se mantiene de forma institucional, pero sin competir con la información del activo. El logo oficial se utiliza una sola vez en la cabecera. La interfaz evita banners decorativos, repetición de marcas y elementos visuales sin relación directa con la consulta de bienes.

## Cambios principales
- Logo oficial FIAS solo en la cabecera.
- Eliminación del banner fotográfico de Mapa de Activos.
- Buscador compacto y funcional.
- Pie de página textual, sin repetición de logo.
- Placeholder neutro cuando no existe fotografía.
- Fotografía del bien amplia y prioritaria cuando sí existe.
- Diseño responsivo para escritorio, tablet y móvil.
- Botones contextuales: Abrir factura, Abrir póliza y Abrir fotografía.
- Pólizas 201380 y 205415 conservadas con sus enlaces definitivos.
- Sin historial de movimientos.

## Implementación
Para actualizar una instalación v5 basta con sustituir principalmente:
- `index.html`
- `styles.css`
- `app.js`

Puede subir el paquete completo si desea mantener todos los archivos sincronizados.

No es necesario modificar Microsoft Entra, Azure, GitHub Actions ni las variables `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `GRAPH_DRIVE_ID` y `GRAPH_ITEM_ID`.
