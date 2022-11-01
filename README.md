![Logo](admin/lametric.png)

# ioBroker.lametric

[![NPM version](https://img.shields.io/npm/v/iobroker.lametric?style=flat-square)](https://www.npmjs.com/package/iobroker.lametric)
[![Downloads](https://img.shields.io/npm/dm/iobroker.lametric?label=npm%20downloads&style=flat-square)](https://www.npmjs.com/package/iobroker.lametric)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/iobroker.lametric?label=npm%20vulnerabilities&style=flat-square)
![node-lts](https://img.shields.io/node/v-lts/iobroker.lametric?style=flat-square)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/iobroker.lametric?label=npm%20dependencies&style=flat-square)

![GitHub](https://img.shields.io/github/license/klein0r/iobroker.lametric?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/klein0r/iobroker.lametric?logo=github&style=flat-square)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/klein0r/iobroker.lametric?logo=github&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/klein0r/iobroker.lametric?logo=github&style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/klein0r/iobroker.lametric?logo=github&style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/klein0r/iobroker.lametric/Test%20and%20Release?label=Test%20and%20Release&logo=github&style=flat-square)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/klein0r/iobroker.lametric?label=repo%20vulnerabilities&logo=github&style=flat-square)

## Versions

![Beta](https://img.shields.io/npm/v/iobroker.lametric.svg?color=red&label=beta)
![Stable](http://iobroker.live/badges/lametric-stable.svg)
![Installed](http://iobroker.live/badges/lametric-installed.svg)

This adapter allows you to get status information about your [LaMetric Time](https://haus-auto.com/p/amz/LaMetricTime) *(Affiliate Link)* and to send notifications to it.
All you need is the IP address of your device and the api developer key.

## Sponsored by

[![ioBroker Master Kurs](https://haus-automatisierung.com/images/ads/ioBroker-Kurs.png)](https://haus-automatisierung.com/iobroker-kurs/?refid=iobroker-lametric)

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
### **WORK IN PROGRESS**

* (klein0r) Minor optimizations
* (klein0r) Updated LaMetric firmware version recommendation to 2.3.0
* (klein0r) Dropped Admin 5 support

### 2.0.0 (2022-05-17)

NodeJS 14.x is required (NodeJS 12.x is EOL)

* (klein0r) Added states for clock alarm widget configuration
* (klein0r) Added duration for My Data DIY frame configuration
* (klein0r) Updated LaMetric firmware version recommendation to 2.2.3
* (klein0r) Updated dependencies
* (klein0r) Updated depedency for js-controller to 4.0.15

### 1.6.0 (2022-02-27)

* (klein0r) Allow german umlauts in My Data DIY objects
* (klein0r) Updated documentation
* (klein0r) Updated state roles
* (klein0r) Added hint for Admin 4 configuration

### 1.5.3 (2022-02-08)

* (klein0r) Updated log messages and error handling
* (klein0r) Updated dependencies

### 1.5.2 (2021-12-23)

* (klein0r) Updated dependencies
* (klein0r) Updated documentation

### 1.5.1

* (klein0r) Translated all objects
* (klein0r) Fixed HTTPS option

## License

The MIT License (MIT)

Copyright (c) 2022 Matthias Kleine <info@haus-automatisierung.com>

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
