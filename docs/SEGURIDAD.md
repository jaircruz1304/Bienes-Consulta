# Seguridad y privacidad

- GitHub Pages público **no es un repositorio privado de datos**. El archivo `data/assets.json` puede descargarse directamente.
- El generador no publica cédulas ni RUC.
- Revise institucionalmente si nombres de custodios, valores de adquisición o ubicaciones deben estar disponibles públicamente. Pueden ocultarse desde la interfaz, pero para retirarlos realmente deben excluirse también en `scripts/build_assets.py`.
- Los enlaces de SharePoint conservan los permisos que Microsoft 365 aplique al recurso, pero no convierta documentos internos en enlaces anónimos si requieren control de acceso.
- Use OIDC para la automatización, no secretos de aplicación de larga duración.
- Proteja la rama `main` y limite quién puede editar workflows.
