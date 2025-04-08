![Logo](../../admin/lametric.png)

# ioBroker.lametric

## Inhaltsverzeichnis

- [Apps](apps.md)
- [Blockly](blockly.md)
- [My Data DIY](my-data-diy.md)
- [Notifications](notifications.md)

## Anforderungen

- nodejs 18 (oder neuer)
- js-controller 5.0.19 (oder neuer)
- Admin Adapter 6.0.0 (oder neuer)
- _LaMetric Time_ mit Firmware _3.1.4_ (oder neuer)
    - Firmware _2.3.9_ (oder neuer) auf älteren Modellen (hergestellt vor dem Jahr 2022)

[Firmware-Changelog](https://firmware.lametric.com) [Firmware-Changelog Time2](https://firmware.lametric.com/?product=time2)

## Konfiguration

1. Füge die LaMetric Time zu Deinem Netzwerk hinzu
    - LaMetric Time App (2017 bis 2021) - [iOS](https://apps.apple.com/de/app/lametric-time/id987445829), [Google Play Store](https://play.google.com/store/apps/details?id=com.smartatoms.lametric)
    - LaMetric App (2022 bis heute) - [iOS](https://apps.apple.com/de/app/lametric/id1502981694), [Google Play Store](https://play.google.com/store/apps/details?id=com.lametric.platform)
2. Kopiere den Geräte-Schlüssel aus der App (nur Modell 2022 und neuer). Für ältere Modelle nutze die folgende Webseite:

Du bekommst Deinen Geräte-Schlüssel (API-Key) [hier](https://developer.lametric.com/user/devices).

![api-key](./img/api-key.png)

## Features

- Verändern der Display-Helligkeit (prozentual, Automatik/Manueller Modus)
- Verändern der Lautstärke (prozentual)
- Konfiguration des Bildschirmschoners (aktivieren/deaktivieren, Zeitbasiert, wenn dunkel)
- Bluetooth aktivieren/deaktivieren, Bluetooth Name verändern
- Zwischen Apps wechseln (nächste, vorige, gehe zu spezifischer App)
- Versenden von Notifications (mit konfigurierbarer Priorität, Sound, Icons, Text, ...)
- Kontrolle von speziellen Apps wie `clock`, `radio`, `stopwatch` oder `weather`
- Nutzung der _My Data (DIY)_ LaMetric App um regelmäßig Informationen darzustellen

Alle Funktionen sind nur durch die [offizielle API](https://lametric-documentation.readthedocs.io/en/latest/reference-docs/lametric-time-reference.html) limitiert.
