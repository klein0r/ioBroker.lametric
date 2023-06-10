# Older changes
## 2.2.1 (2023-01-19)

* (klein0r) Format number values for My Data DIY

## 2.2.0 (2023-01-05)

* (klein0r) Added custom sound feature (mp3 via url)
* (klein0r) Added visible state of widgets
* (klein0r) Updated LaMetric firmware version recommendation to 2.3.3

## 2.1.0 (2022-11-01)

NodeJS 14.5 is required

* (klein0r) Added web extension to get My Data DIY object
* (klein0r) Allow colon in My Data DIY object ID
* (klein0r) Fixed duration of My Data DIY frames (milliseconds)
* (klein0r) Updated LaMetric firmware version recommendation to 2.3.0
* (klein0r) Dropped Admin 5 support
* (klein0r) Minor optimizations

## 2.0.0 (2022-05-17)

NodeJS 14.x is required (NodeJS 12.x is EOL)

* (klein0r) Added states for clock alarm widget configuration
* (klein0r) Added duration for My Data DIY frame configuration
* (klein0r) Updated LaMetric firmware version recommendation to 2.2.3
* (klein0r) Updated dependencies
* (klein0r) Updated depedency for js-controller to 4.0.15

## 1.6.0 (2022-02-27)

* (klein0r) Allow german umlauts in My Data DIY objects
* (klein0r) Updated documentation
* (klein0r) Updated state roles
* (klein0r) Added hint for Admin 4 configuration

## 1.5.3 (2022-02-08)

* (klein0r) Updated log messages and error handling
* (klein0r) Updated dependencies

## 1.5.2 (2021-12-23)

* (klein0r) Updated dependencies
* (klein0r) Updated documentation

## 1.5.1

* (klein0r) Translated all objects
* (klein0r) Fixed HTTPS option

## 1.5.0

* (klein0r) Fixed myData DIY data type **(BREAKING CHANGE - requires SimpleAPI 2.6.2 or later to use json parameter)**
* (klein0r) Added version check

## 1.4.1

* (klein0r) Fixed missing translations

## 1.4.0

* (klein0r) Admin 5 Support

## 1.3.2

* (klein0r) Updated dependencies

## 1.3.1

* (klein0r) Added local start and end time for screensaver

## 1.3.0

* (klein0r) Encrypt sensitive information **(BREAKING CHANGE - RE-ENTER YOUR API KEY)**

## 1.2.1

* (klein0r) Extended regex for My Data (DIY)

## 1.2.0

* (klein0r) Added hide if value for My Data (DIY)
* (klein0r) Remove frames without text from My Data (DIY)
* (klein0r) Allow dynamic states for My Data (DIY) icons

## 1.1.3

* (klein0r) Fixed async object creation

## 1.1.2

* (klein0r) Delete app channels if app was deleted on LaMetric
* (klein0r) Custom app configuration (clockface, countdown duration)

## 1.1.1

* (klein0r) Fixed replacement issue for My Data (DIY)
* (klein0r) Updated README with more configuration details

## 1.1.0

* (klein0r) Added support for My Data (DIY)

## 1.0.1

* (klein0r) Added chart data support to notification

## 1.0.0

* (klein0r) First stable release
* (klein0r) Added iobroker sentry
* (klein0r) Added brightness and volume limit information (min, max)

## 0.0.10

* (klein0r) Switched to axios lib

## 0.0.9

* (klein0r) Added missing translations
* (GermanBluefox) Improved Blockly and main.js

## 0.0.8

* (klein0r) Updated dependencies

## 0.0.7

* (klein0r) fixed blockly

## 0.0.6

* (klein0r) switched to setTimeout instead of setInterval, improved logging and fixes eslint complaints

## 0.0.5

* (klein0r) Fixed notification, html, updated github template, enable and disable screensaver

## 0.0.4

* (klein0r) Refactored blockly sendTo / notifications

## 0.0.3

* (klein0r) Added app switching support, refactored everything
* (bluefox) The deletion of the actual shown information was added

## 0.0.2

* (Sigi74) Change message_value for variables message
* (Sigi74) Leave sound none

## 0.0.1

* (klein0r) initial release
