# UI v4 · Identidad visual FIAS real

Esta versión corrige la identidad visual de la plataforma para utilizar los recursos reales publicados en el Portal de Innovación Digital FIAS.

## Recursos institucionales utilizados

- Logo oficial FIAS: `https://fias.org.ec/wp-content/uploads/2021/11/Logo_FIAS_web.png`
- Imagen institucional Mapa de Activos: `https://raw.githubusercontent.com/jaircruz1304/FIAS/refs/heads/main/img-portal/03.%20Mapa-Bienes.png`
- Portal de referencia visual: `https://jaircruz1304.github.io/FIAS/Portal-Digital.html#herramientas`

## Ajustes visuales

- Paleta homologada con el portal existente:
  - azul FIAS `#005596`
  - azul oscuro `#00385f`
  - verde FIAS `#8dc63f`
  - verde oscuro `#6fa42e`
- Cabecera con el logo oficial FIAS y franja verde institucional.
- Hero principal con la imagen real del Mapa de Activos del portal.
- Fotografías de bienes ampliadas y mostradas con `object-fit: contain`, evitando recortes.
- Mejor comportamiento en escritorio, tableta y móvil.
- Se mantiene la sincronización automática Excel → JSON sin modificaciones.
- Se mantienen factura, póliza y fotografía como accesos directos contextuales.
- No se incorpora historial de movimientos.

## Publicación

Reemplazar el contenido actual del repositorio `jaircruz1304/Bienes-Consulta` por esta versión o, como mínimo, actualizar:

- `index.html`
- `styles.css`
- `app.js`

No es necesario modificar Azure, Microsoft Entra, Graph, secretos ni variables existentes.


## Pólizas definitivas (v5)

El generador vincula automáticamente los números de póliza registrados en `Inventario Mejorado` con los enlaces institucionales confirmados:

- **201380 — Póliza Multirriesgo**: https://fiasec-my.sharepoint.com/:b:/g/personal/jcruzg_fias_org_ec/IQC9D6Pxpa8GQpLHK7ErGsQNASOUPisr1J3CbL0SeBzdDl4?e=sli8hq
- **205415 — Póliza Vehicular**: https://fiasec-my.sharepoint.com/:b:/g/personal/jcruzg_fias_org_ec/IQBouryl0D4zQKJsMI647PYMAd97tciEG9DO1v-Z9fwDWTE?e=NVTlds

Estos enlaces solo se muestran cuando el número de póliza del bien coincide.
