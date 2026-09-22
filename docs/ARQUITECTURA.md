# Arquitectura de producción

```text
Excel oficial (OneDrive / SharePoint)
        │
        │ Microsoft Graph (solo automatización)
        ▼
GitHub Actions ── compara eTag ──► sin cambio: termina
        │
        └── si cambió ─► descarga Excel ─► valida ─► assets.json
                                               │
                                               ▼
                                      GitHub Pages / QR
```

## Principios

1. **Fuente única:** el Excel institucional sigue siendo el registro oficial.
2. **Lectura rápida:** el navegador consulta un JSON estático, no Microsoft Graph.
3. **Actualización controlada:** el JSON cambia únicamente cuando el archivo fuente cambia y el resultado supera validaciones.
4. **Continuidad:** si Microsoft 365 falla, la última versión válida del JSON sigue disponible.
5. **Sin historial:** esta versión no implementa movimientos históricos.
6. **Documentos condicionales:** factura, póliza, acta y otros enlaces solo aparecen si existen.

## Frecuencia

El flujo está configurado cada 15 minutos. Puede cambiarse en `.github/workflows/sync-inventory.yml`. La ejecución programada solo consulta metadatos; no descarga el Excel si el `eTag` permanece igual.
