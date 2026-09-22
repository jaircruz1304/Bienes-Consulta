# Disparo inmediato opcional con Power Automate

El proyecto funciona sin Power Automate: GitHub Actions revisa el Excel cada 15 minutos y solo publica si cambió.

Si se desea actualización casi inmediata, puede agregarse un flujo de Power Automate que detecte la modificación del archivo en SharePoint/OneDrive y envíe un evento `repository_dispatch` de tipo `inventory_changed` al repositorio.

El workflow ya escucha ese evento. Mantenga también el `schedule` como mecanismo de respaldo.

Esta capa es opcional: no es necesaria para que la plataforma funcione ni para que el JSON se actualice automáticamente.
