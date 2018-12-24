![Logo](admin/lametric.png)
# ioBroker.lametric
=================

This adapter allows you to get status information about your LaMetric Time and to send notification to it.
All you need is the IP address of your device and the api developer key.

## Configuration
You can get your personal key [here](https://developer.lametric.com/).

![api-key](docs/apiKey.png)

## Usage
To show the message on your la metric just send a message to this instance with script adapter:
```
sendTo('lametric.0', 'send', {
    "priority": "[info|warning|critical]",
    "icon_type": "[none|info|alert]",
    "lifeTime": <milliseconds>,
    "model": {
    "frames": [
         {
            "icon":"<icon id or base64 encoded binary>",
            "text":"<text>"
         },
         {
           "icon": 298,
           "text":"text"
         },
         {
             "icon": 120,
             "goalData":{
                 "start": 0,
                 "current": 50,
                 "end": 100,
                 "unit": "%"
             }
         },
         {
             "chartData": [ <comma separated integer values> ] // [ 1, 2, 3, 4, 5, 6, 7 ]
         }
         ],
         "sound": {
           "category":"[alarms|notifications]",
             "id":"<sound_id>",
             "repeat":<repeat count>
         },
         "cycles":<cycle count>
    }
});
```

Example to show some information cyclic:
```
let i = 0;
function show() {
    console.log('Show ' + i);
    sendTo('lametric.0', 'send', {
        "priority": "info",
        "icon_type": "info",
        "lifeTime": 10000,
        "model": {
        "frames": [
                {
                    "icon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuNWRHWFIAAABSSURBVBhXY1AIznff9ctz7z///yAEZAC5ytHVDEAKygIDpYhyiDoGIIaIQnQAGUAuVIJDRBpZAsglJAE0F1kCyAVJwC0HKgQihOUQq9CQSlw9AD51V+Bl/0hPAAAAAElFTkSuQmCC",
                    "text":"Hi " + i
                }
            ],
            "cycles": 0
        }
    });
    i++;
}
setInterval(show, 10000);
show();
```


You can read more about notifications here: https://lametric-documentation.readthedocs.io/en/latest/reference-docs/device-notifications.html

## Changelog

### 0.1.0
* (bluefox) The deletion of the actual shown information was added

### 0.0.2
* (Sigi74) Change message_value for variables message
* (Sigi74) Leave sound none

### 0.0.1
* (klein0r) initial release

## License

The MIT License (MIT)

Copyright (c) 2018 Matthias Kleine <info@haus-automatisierung.com>

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
