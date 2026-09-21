# FIAS · Consulta de bienes por QR

## Contenido
Este paquete contiene una versión funcional de GitHub Pages basada en la hoja **Inventario Mejorado** del archivo suministrado.

- Registros procesados: **439**
- Códigos únicos: **439**
- Registros con enlace de fotografía localizado: **389**
- La versión incluida en `site/data/assets.json` es **PÚBLICA/REDUCIDA**: no contiene cédulas, RUC, valores, facturas ni enlaces financieros.

## Publicación rápida
1. Cree el repositorio `consulta` dentro de la cuenta u organización `fias-activos`.
2. Copie **todo el contenido de la carpeta `site/`** a la raíz del repositorio.
3. Active GitHub Pages desde la rama principal.
4. Verifique la URL:
   `https://fias-activos.github.io/consulta/?codigo=FIAS.00.01.001`
5. El archivo `qr-links.csv` contiene la URL correspondiente a cada código para generar las etiquetas QR.

## Fuente de datos
Actualmente `config.js` usa:
`./data/assets.json`

Puede cambiar `dataUrl` por cualquier endpoint JSON que entregue la misma estructura.

## OneDrive / Excel
Para producción se recomiendan dos alternativas:

### A. Sitio público
Mantener únicamente campos no sensibles. Un flujo de Power Automate u Office Script puede leer la tabla de Excel y actualizar un JSON público. No coloque secretos, tokens ni credenciales dentro de GitHub Pages.

### B. Sitio institucional autenticado
Registrar la página como una **Single Page Application (SPA)** en Microsoft Entra ID y usar MSAL + Microsoft Graph para que el usuario inicie sesión y lea la tabla de Excel directamente desde OneDrive/SharePoint. Así el Excel sigue siendo la fuente única y los cambios pueden verse al consultar nuevamente, sin publicar la base completa.

## Estructura recomendada de la tabla
La hoja ya contiene los campos necesarios. Para una integración estable conviene mantener el rango como tabla de Excel y conservar un nombre fijo, por ejemplo `Tabla1`.

## Observaciones de datos
- La hoja contiene 43 columnas.
- Se localizaron enlaces de fotografía en la hoja `Link_fotos`.
- Los campos calculados de depreciación/garantía deben ser evaluados por Excel/OneDrive antes de exponerlos mediante una API; algunos motores externos no evalúan correctamente las referencias estructuradas.
- El historial de movimientos no aparece como una tabla independiente en el archivo analizado. Para mostrar historial real, conviene crear una hoja/tabla `MOVIMIENTOS` con: código, fecha, tipo de movimiento, custodio anterior, custodio nuevo, ubicación anterior, ubicación nueva, documento y observación.
- Los enlaces de SharePoint pueden requerir inicio de sesión. La página intenta mostrar la fotografía y, si no es posible, conserva el botón para abrirla.

## Seguridad
GitHub Pages público no debe alojar cédulas, RUC, facturas, documentos internos o datos que requieran control de acceso.
