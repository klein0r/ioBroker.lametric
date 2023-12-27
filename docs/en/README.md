![Logo](../../admin/lametric.png)

# ioBroker.lametric

## Table of contents

- [Apps](apps.md)
- [Blockly](blockly.md)
- [My Data DIY](my-data-diy.md)
- [Notifications](notifications.md)

## Requirements

- nodejs 14.5 (or later)
- js-controller 4.0.15 (or later)
- Admin Adapter 6.0.0 (or later)
- _LaMetric Time_ with firmware _2.3.8_ (_3.0.21_ on the 2022 model) (or later)

[Firmware-Changelog](https://firmware.lametric.com) [Firmware-Changelog Time2](https://firmware.lametric.com/?product=time2)

## Configuration

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
