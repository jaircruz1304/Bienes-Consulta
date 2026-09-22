# Implementación paso a paso

## 1. Crear o preparar el repositorio

Repositorio objetivo: `jaircruz1304/Bienes-Consulta`. Copie el contenido de este paquete a la raíz y haga `push` a la rama principal.

En **Settings → Pages**, publique desde la rama principal (`main`) y raíz (`/`). La ficha quedará en:

`https://jaircruz1304.github.io/Bienes-Consulta/?codigo=FIAS.26.03.083`

## 2. Ubicar el Excel oficial

Mantenga el archivo en OneDrive for Business o, preferiblemente para una arquitectura institucional, en una biblioteca de SharePoint. La automatización necesita el `driveId` y `itemId` del archivo.

La hoja principal debe llamarse exactamente `Inventario Mejorado`. También se reconocen:

- `Link_fotos`: `CÓDIGO | LINK`.
- `links`: se usa como respaldo para factura, buscando el número de factura en la primera columna.
- `DOCUMENTOS_BIENES` (opcional): permite registrar pólizas, actas y otros documentos sin tocar el código.

## 3. Crear la aplicación de Microsoft Entra

Cree un registro de aplicación para la automatización GitHub → Microsoft Graph. Configure una **credencial federada de GitHub Actions (OIDC)** mediante el asistente actual de Microsoft Entra, seleccionando el propietario, repositorio y rama correspondientes. No use `client secret`.

Para descargar el Excel, Microsoft Graph admite permisos de aplicación de lectura. Si el libro está en un área institucional de SharePoint, aplique el principio de mínimo privilegio y limite la aplicación al sitio correspondiente cuando su administración lo permita.

## 4. Variables del repositorio

En **Settings → Secrets and variables → Actions → Variables**, cree:

- `AZURE_CLIENT_ID`: Application (client) ID.
- `AZURE_TENANT_ID`: Directory (tenant) ID.
- `GRAPH_DRIVE_ID`: ID de la unidad/biblioteca que contiene el Excel.
- `GRAPH_ITEM_ID`: ID del archivo Excel.

No es necesario almacenar una contraseña de Microsoft en GitHub.

## 5. Primera sincronización

Abra **Actions → Sincronizar inventario → Run workflow**.

El flujo:

1. inicia sesión en Microsoft Entra mediante OIDC;
2. obtiene un token de Microsoft Graph;
3. consulta el `eTag` del Excel;
4. descarga el libro si cambió;
5. genera `data/assets.json`;
6. verifica códigos duplicados, URLs y campos sensibles prohibidos;
7. hace commit solo si hay una nueva versión válida.

La copia inicial incluida en este paquete sirve para desplegar y probar la interfaz; la primera sincronización autorizada la reemplaza por la versión generada desde el Excel oficial.

## 6. Documentación adicional

Para pólizas, actas u otros respaldos se recomienda agregar al Excel una hoja `DOCUMENTOS_BIENES` con esta estructura:

`CODIGO | TIPO_DOCUMENTO | NOMBRE | URL | VIGENTE | OBSERVACION`

Tipos recomendados: `POLIZA`, `ACTA_ENTREGA`, `ACTA_CUSTODIA`, `GARANTIA`, `OTRO`.

No es necesario crear registros para documentos inexistentes.

## 7. Códigos QR

El contenido del QR debe ser exclusivamente:

`https://jaircruz1304.github.io/Bienes-Consulta/?codigo=<CODIGO>`

Ejemplo:

`https://jaircruz1304.github.io/Bienes-Consulta/?codigo=FIAS.26.03.083`

## 8. Prueba antes de producción

Verifique al menos:

- un bien con fotografía y factura;
- un bien sin documentos;
- un bien asegurado;
- un bien con garantía;
- un bien con estado especial;
- un código inexistente;
- consulta desde teléfono mediante QR.

## 9. Actualizaciones futuras

El personal continúa trabajando únicamente en Excel. El portal no requiere regeneración manual. El flujo programado revisa el archivo cada 15 minutos; si no cambió, no modifica nada.
