![Logo](admin/lametric.png)

# ioBroker.lametric

[![NPM version](https://img.shields.io/npm/v/iobroker.lametric?style=flat-square)](https://www.npmjs.com/package/iobroker.lametric)
[![Downloads](https://img.shields.io/npm/dm/iobroker.lametric?label=npm%20downloads&style=flat-square)](https://www.npmjs.com/package/iobroker.lametric)
![node-lts](https://img.shields.io/node/v-lts/iobroker.lametric?style=flat-square)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/iobroker.lametric?label=npm%20dependencies&style=flat-square)

![GitHub](https://img.shields.io/github/license/klein0r/iobroker.lametric?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/klein0r/iobroker.lametric?logo=github&style=flat-square)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/klein0r/iobroker.lametric?logo=github&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/klein0r/iobroker.lametric?logo=github&style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/klein0r/iobroker.lametric?logo=github&style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/klein0r/iobroker.lametric/test-and-release.yml?branch=master&logo=github&style=flat-square)

## Versions

![Beta](https://img.shields.io/npm/v/iobroker.lametric.svg?color=red&label=beta)
![Stable](http://iobroker.live/badges/lametric-stable.svg)
![Installed](http://iobroker.live/badges/lametric-installed.svg)

This adapter allows you to get status information about your [LaMetric Time](https://haus-auto.com/p/amz/LaMetricTime) *(Affiliate Link)* and to send notifications to it.
All you need is the IP address of your device and the api developer key.

## Sponsored by

[![ioBroker Master Kurs](https://haus-automatisierung.com/images/ads/ioBroker-Kurs.png?2024)](https://haus-automatisierung.com/iobroker-kurs/?refid=iobroker-lametric)

## Installation

Please use the "adapter list" in ioBroker to install a stable version of this adapter. You can also use the CLI to install this adapter:

```
iobroker add lametric
```

## Documentation

[🇺🇸 Documentation](./docs/en/README.md)

[🇩🇪 Dokumentation](./docs/de/README.md)

## Sentry

**This adapter uses Sentry libraries to automatically report exceptions and code errors to the developers.** For more details and for information how to disable the error reporting see [Sentry-Plugin Documentation](https://github.com/ioBroker/plugin-sentry#plugin-sentry)! Sentry reporting is used starting with js-controller 3.0.

## Changelog

<!--
  Placeholder for the next version (at the beginning of the line):
  ### **WORK IN PROGRESS**
-->
### 4.1.0 (2025-07-09)

* (@klein0r) Allow icons with placeholders in config (improved validation)
* (@klein0r) Updated LaMetric firmware version recommendation to 2.3.9 (3.2.3)

### 4.0.0 (2025-04-08)

NodeJS >= 20.x and js-controller >= 6 is required

* (@klein0r) Updated LaMetric firmware version recommendation to 2.3.9 (3.1.4)

### 3.4.1 (2024-10-29)

* (@klein0r) Limit frame duration to 10 seconds (limited by LaMetric)

### 3.4.0 (2024-09-06)

* (@klein0r) Updated LaMetric firmware version recommendation to 2.3.9 (3.1.2)
* (@klein0r) Added support for notification manager
* (@klein0r) Added validator for icon inputs
* (@klein0r) Fixed some missing translations

### 3.3.0 (2024-08-05)

* (@klein0r) Added api version as state (and check value)

## License

The MIT License (MIT)

Copyright (c) 2025 Matthias Kleine <info@haus-automatisierung.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
