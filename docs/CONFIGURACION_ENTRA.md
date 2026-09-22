# Microsoft Entra y Microsoft Graph

## Modelo recomendado

Use **Workload Identity Federation / OIDC** entre GitHub Actions y Microsoft Entra. Esto evita guardar un `client secret` de larga duración en GitHub.

## Permiso de lectura

El workflow descarga el archivo con Microsoft Graph mediante:

`GET /drives/{drive-id}/items/{item-id}/content`

La aplicación debe contar con permisos de aplicación suficientes para leer ese archivo. Para entornos institucionales, prefiera alcance restringido al sitio/biblioteca cuando sea viable; evite otorgar acceso amplio a todos los archivos si no es necesario.

## Credencial federada

Cree la credencial mediante el asistente de GitHub Actions de Microsoft Entra, en lugar de escribir manualmente el `subject`, para que coincida con el formato OIDC vigente de GitHub.

## Datos que NO deben agregarse al frontend

El generador excluye deliberadamente `CEDULA CUSTODIO` y `RUC DE PROVEEDOR`. Si GitHub Pages es público, cualquier dato incluido en `assets.json` debe considerarse públicamente accesible aunque el sitio use `robots.txt`.
