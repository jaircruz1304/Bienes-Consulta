# UI v6 · Simplificación visual

Esta versión reduce la carga visual de la plataforma y mantiene como foco principal la ficha del bien.

## Cambios
- El logo oficial FIAS se utiliza una sola vez, en la cabecera.
- Se eliminó el gran banner fotográfico porque competía visualmente con la información del activo y no aportaba contexto directo a la consulta de inventario.
- El buscador pasó a una franja compacta y funcional.
- El pie de página ya no repite el logo.
- El estado sin fotografía utiliza un icono neutro; no vuelve a repetir la identidad institucional.
- La fotografía del activo sigue siendo amplia, pero la ficha completa ocupa menos altura y aprovecha mejor la pantalla.
- Se conserva el comportamiento responsivo para escritorio, tablet y móvil.
- Se mantienen los botones Abrir factura, Abrir póliza y Abrir fotografía solo cuando existe el respaldo correspondiente.
- Se mantienen la sincronización Excel → JSON, las pólizas 201380 y 205415 y toda la lógica de generación existente.

## Archivos modificados
- `index.html`
- `styles.css`
- `app.js`

No es necesario modificar Azure, Microsoft Entra, GitHub Actions ni las variables de Microsoft Graph.
