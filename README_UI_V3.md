# FIAS Bienes — Actualización visual v3

Esta versión conserva la sincronización automática Excel → JSON ya operativa y actualiza únicamente la capa de presentación y el enriquecimiento documental.

## Cambios incorporados

- Cabecera institucional FIAS y marca local SVG para evitar dependencias externas.
- Fotografía del bien ampliada y mostrada con `object-fit: contain` para evitar recortes innecesarios.
- Diseño responsivo optimizado para escritorio, tablet y móvil.
- Eliminado el botón `Copiar enlace`.
- Botón `Abrir factura` visible solo cuando exista factura digital.
- Botón `Abrir póliza` visible solo cuando el bien tenga una póliza con documento asociado.
- Sección documental más clara con factura, póliza, actas y fotografía.
- Pólizas ancladas automáticamente por número:
  - 205415 — Vehicular — vigencia 01/01/2026 a 01/01/2027.
  - 201380 — Multirriesgo — vigencia 01/01/2026 a 01/01/2027.
- Los estados especiales siguen apareciendo únicamente cuando hay información que los sustenta.
- No se incorpora historial de movimientos en esta etapa.

## Implementación

Reemplaza en el repositorio `jaircruz1304/Bienes-Consulta` los archivos de esta versión manteniendo las variables y credenciales ya configuradas. El workflow de sincronización continúa usando `scripts/build_assets.py` y regenerará `data/assets.json` cuando cambie el Excel oficial.

## Nota de marca

`assets/fias-institucional.svg` es un recurso local de cabecera preparado para la plataforma. Si FIAS dispone de un archivo maestro oficial del logotipo (SVG/PNG), basta con reemplazar ese archivo conservando el mismo nombre para que toda la interfaz adopte el arte oficial sin cambiar código.
