# Bienes-Consulta UI v9 — Cámara QR + OCR

Esta versión conserva la arquitectura de v8 (Excel oficial → GitHub Actions → JSON + fotografías locales WEBP) e incorpora lectura de etiquetas desde cámara o fotografía.

## Casos cubiertos

1. QR con enlace actual de Bienes-Consulta.
2. QR antiguo que contiene el código del bien junto con descripción u otros datos.
3. QR que contiene texto pero no una URL.
4. Etiquetas sin QR, mediante OCR.
5. Fotografías de etiquetas tomadas desde el teléfono o seleccionadas desde el equipo.

## Reconocimiento de códigos

La aplicación no depende de una sola expresión regular. Compara la lectura con todos los códigos existentes en `data/assets.json`. Esto permite reconocer familias distintas, por ejemplo:

- `FIAS.25.03.064`
- `FIAS.18.03.007`
- `FIAS.18.01.128`
- `MOE001REM.35`
- `MOE001REM.36`

Los puntos, espacios y algunos errores habituales de OCR (O/0, I/1, etc.) se toleran mediante normalización y comparación aproximada.

## Motor QR

- Primero utiliza `BarcodeDetector` cuando el navegador lo soporta.
- Como respaldo utiliza `jsQR`, cargado bajo demanda.
- El QR se analiza continuamente mientras la cámara está abierta.

## OCR

- Se ejecuta solamente cuando el usuario pulsa `Leer texto (OCR)`.
- Usa Tesseract.js en el navegador y carga el motor únicamente la primera vez que se necesita.
- La imagen se convierte a escala de grises y se incrementa el contraste antes del reconocimiento.
- Si identifica con alta confianza un código existente, abre la ficha automáticamente.
- Si no identifica un código completo, utiliza descripción, serie, marca, modelo y ubicación para proponer posibles coincidencias.

## Privacidad

La cámara se procesa en el navegador del usuario. El proyecto no incorpora una API propia para enviar capturas a un servidor FIAS. Tesseract.js procesa la imagen localmente en el dispositivo.

## Requisitos

- GitHub Pages sirve el sitio bajo HTTPS, requisito para `getUserMedia`.
- El usuario debe conceder permiso de cámara.
- Si la cámara está bloqueada, `Usar foto` sigue disponible.
- El primer uso de OCR requiere descargar los componentes de Tesseract.js y el idioma configurado.

## Archivos nuevos o modificados

- `index.html`: botón y modal de escaneo.
- `scanner.js`: cámara, QR, OCR y resolución de códigos.
- `app.js`: expone una API interna mínima al lector.
- `styles.css`: interfaz responsiva del lector.
- `config.js`: configuración del lector.

No se modifica la sincronización de Microsoft Graph ni las variables existentes.
