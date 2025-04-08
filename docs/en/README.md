![Logo](../../admin/lametric.png)

# ioBroker.lametric

## Table of contents

- [Apps](apps.md)
- [Blockly](blockly.md)
- [My Data DIY](my-data-diy.md)
- [Notifications](notifications.md)

## Requirements

- nodejs 20 (or later)
- js-controller 6.0.0 (or later)
- Admin Adapter 7.4.10 (or later)
- _LaMetric Time_ with firmware _3.1.4_ (or later)
    - firmware _2.3.9_ (or later) on older models (produced before year 2022)

[Firmware-Changelog](https://firmware.lametric.com) [Firmware-Changelog Time2](https://firmware.lametric.com/?product=time2)

## Configuration

1. Add the LaMetric Time to your local network
    - LaMetric Time App (2017 to 2021) - [iOS](https://apps.apple.com/de/app/lametric-time/id987445829), [Google Play Store](https://play.google.com/store/apps/details?id=com.smartatoms.lametric)
    - LaMetric App (2022 to heute) - [iOS](https://apps.apple.com/de/app/lametric/id1502981694), [Google Play Store](https://play.google.com/store/apps/details?id=com.lametric.platform)
2. Copy the device API key from the app (only models 2022 and newer). Use the following website for older models:

You can get your device API key [here](https://developer.lametric.com/user/devices).

![api-key](./img/api-key.png)

## Features

- Set display brightness (percent, auto-mode/manual-mode)
- Set audio volume (percent)
- Configure screensaver (enable/disable, time based, when dark)
- Activate/Deactivate bluetooth and change bluetooth name
- Switch between apps (next, previous, go to specific app)
- Send notifications with blockly (with configurable priority, sound, icons, text, ...)
- Control special apps like `clock`, `radio`, `stopwatch` or `weather`
- Use _My Data (DIY)_ LaMetric App to display persistent information

Features are limited by the [official API features](https://lametric-documentation.readthedocs.io/en/latest/reference-docs/lametric-time-reference.html).
