![Logo](admin/lametric.png)

# ioBroker.lametric

[![NPM version](http://img.shields.io/npm/v/iobroker.lametric.svg)](https://www.npmjs.com/package/iobroker.lametric)
[![Downloads](https://img.shields.io/npm/dm/iobroker.lametric.svg)](https://www.npmjs.com/package/iobroker.lametric)
[![Stable](http://iobroker.live/badges/lametric-stable.svg)](http://iobroker.live/badges/lametric-stable.svg)
[![installed](http://iobroker.live/badges/lametric-installed.svg)](http://iobroker.live/badges/lametric-installed.svg)

[![NPM](https://nodei.co/npm/iobroker.lametric.png?downloads=true)](https://nodei.co/npm/iobroker.lametric/)

This adapter allows you to get status information about your LaMetric Time and to send notifications to it.
All you need is the IP address of your device and the api developer key.

## Configuration

You can get your personal key [here](https://developer.lametric.com/).

![api-key](docs/apiKey.png)

## Usage

You can read more about notifications here: https://lametric-documentation.readthedocs.io/en/latest/reference-docs/device-notifications.html

## Changelog

### 0.0.4
* (klein0r) Refactored blockly sendTo / notifications

### 0.0.3
* (klein0r) Added app switching support, refactored everything
* (bluefox) The deletion of the actual shown information was added

### 0.0.2
* (Sigi74) Change message_value for variables message
* (Sigi74) Leave sound none

### 0.0.1
* (klein0r) initial release

## License

The MIT License (MIT)

Copyright (c) 2019 Matthias Kleine <info@haus-automatisierung.com>

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
