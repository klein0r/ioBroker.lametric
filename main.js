/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

const utils = require('@iobroker/adapter-core');
const axios = require('axios');
const adapterName = require('./package.json').name.split('.').pop();

class LaMetric extends utils.Adapter {

    constructor(options) {
        super({
            ...options,
            name: adapterName,
        });

        this.refreshStateTimeout = null;
        this.refreshAppTimeout = null;
        this.refreshMyDataDiyTimeout = null;

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        this.subscribeStates('*');

        this.refreshState();
        this.refreshApps();
        this.refreshMyDataDIY();
    }

    onStateChange(id, state) {
        if (id && state && !state.ack) {
            // No ack = changed by user
            if (id === this.namespace + '.meta.display.brightness') {
                this.log.debug('changing brightness to ' + state.val);

                this.buildRequest(
                    'device/display',
                    (content, status) => {
                        this.setState('meta.display.brightness', {val: content.success.data.brightness, ack: true});
                        this.setState('meta.display.brightnessMin', {val: content.success.data.brightness_limit.min, ack: true});
                        this.setState('meta.display.brightnessMax', {val: content.success.data.brightness_limit.max, ack: true});
                        this.setState('meta.display.brightnessAuto', {val: content.success.data.brightness_mode === 'auto', ack: true});
                        this.setState('meta.display.brightnessMode', {val: content.success.data.brightness_mode, ack: true});
                    },
                    'PUT',
                    {
                        brightness: state.val,
                        brightness_mode: 'manual'
                    }
                );
            } else if (id === this.namespace + '.meta.display.brightnessAuto') {
                this.log.debug('changing auto brightness mode to ' + state.val);

                this.buildRequest(
                    'device/display',
                    (content, status) => {
                        this.setState('meta.display.brightness', {val: content.success.data.brightness, ack: true});
                        this.setState('meta.display.brightnessMin', {val: content.success.data.brightness_limit.min, ack: true});
                        this.setState('meta.display.brightnessMax', {val: content.success.data.brightness_limit.max, ack: true});
                        this.setState('meta.display.brightnessAuto', {val: content.success.data.brightness_mode === 'auto', ack: true});
                        this.setState('meta.display.brightnessMode', {val: content.success.data.brightness_mode, ack: true});
                    },
                    'PUT',
                    {
                        brightness_mode: state.val ? 'auto' : 'manual'
                    }
                );
            } else if (id === this.namespace + '.meta.audio.volume') {
                this.log.debug('changing volume to ' + state.val);

                this.buildRequest(
                    'device/audio',
                    (content, status) => {
                        this.setState('meta.audio.volume', {val: content.success.data.volume, ack: true});
                        this.setState('meta.audio.volumeMin', {val: content.success.data.volume_limit.min, ack: true});
                        this.setState('meta.audio.volumeMax', {val: content.success.data.volume_limit.max, ack: true});
                    },
                    'PUT',
                    {
                        volume: state.val
                    }
                );
            } else if (id === this.namespace + '.meta.bluetooth.active') {
                this.log.debug('changing bluetooth state to ' + state.val);

                this.buildRequest(
                    'device/bluetooth',
                    (content, status) => {
                        this.setState('meta.bluetooth.active', {val: content.success.data.active, ack: true});
                        this.setState('meta.bluetooth.available', {val: content.success.data.available, ack: true});
                        this.setState('meta.bluetooth.discoverable', {val: content.success.data.discoverable, ack: true});
                        this.setState('meta.bluetooth.address', {val: content.success.data.mac, ack: true});
                        this.setState('meta.bluetooth.name', {val: content.success.data.name, ack: true});
                        this.setState('meta.bluetooth.pairable', {val: content.success.data.pairable, ack: true});
                    },
                    'PUT',
                    {
                        active: state.val
                    }
                );
            } else if (id === this.namespace + '.meta.bluetooth.name') {
                this.log.debug('changing bluetooth name to ' + state.val);

                this.buildRequest(
                    'device/bluetooth',
                    (content, status) => {
                        this.setState('meta.bluetooth.active', {val: content.success.data.active, ack: true});
                        this.setState('meta.bluetooth.available', {val: content.success.data.available, ack: true});
                        this.setState('meta.bluetooth.discoverable', {val: content.success.data.discoverable, ack: true});
                        this.setState('meta.bluetooth.address', {val: content.success.data.mac, ack: true});
                        this.setState('meta.bluetooth.name', {val: content.success.data.name, ack: true});
                        this.setState('meta.bluetooth.pairable', {val: content.success.data.pairable, ack: true});
                    },
                    'PUT',
                    {
                        name: state.val
                    }
                );
            } else if (id === this.namespace + '.apps.next') {
                this.log.debug('changing to next app');

                this.buildRequest(
                    'device/apps/next',
                    null,
                    'PUT',
                    null
                );
            } else if (id === this.namespace + '.apps.prev') {
                this.log.debug('changing to previous app');

                this.buildRequest(
                    'device/apps/prev',
                    null,
                    'PUT',
                    null
                );
            } else if (id === this.namespace + '.meta.display.screensaver.enabled') {
                this.log.debug('changing screensaver state to ' + state.val);

                this.buildRequest(
                    'device/display',
                    (content, status) => {
                        this.setState('meta.display.screensaver.enabled', {val: content.success.data.screensaver.enabled, ack: true});
                        this.setState('meta.display.screensaver.widget', {val: content.success.data.screensaver.widget, ack: true});
                        this.setState('meta.display.screensaver.modes.timeBased.enabled', {val: content.success.data.screensaver.modes.time_based.enabled, ack: true});
                        this.setState('meta.display.screensaver.modes.timeBased.startTime', {val: content.success.data.screensaver.modes.time_based.start_time, ack: true});
                        this.setState('meta.display.screensaver.modes.timeBased.endTime', {val: content.success.data.screensaver.modes.time_based.end_time, ack: true});
                        this.setState('meta.display.screensaver.modes.whenDark.enabled', {val: content.success.data.screensaver.modes.when_dark.enabled, ack: true});
                    },
                    'PUT',
                    {
                        screensaver: {
                            enabled: state.val
                        }
                    }
                );
            } else if (id.indexOf(this.namespace + '.meta.display.screensaver.modes.') > -1) {
                this.log.debug('changing screensaver settings');

                this.getStates(
                    'meta.display.screensaver.*',
                    (err, states) => {

                        const screensaverState = states[this.namespace + '.meta.display.screensaver.enabled'].val;
                        const currentModeParams = {};
                        let currentMode = 'when_dark';

                        if (id.indexOf('timeBased') > -1) {
                            currentMode = 'time_based';
                            currentModeParams.enabled = states[this.namespace + '.meta.display.screensaver.modes.timeBased.enabled'].val;
                            currentModeParams.start_time = states[this.namespace + '.meta.display.screensaver.modes.timeBased.startTime'].val;
                            currentModeParams.end_time = states[this.namespace + '.meta.display.screensaver.modes.timeBased.endTime'].val;
                        } else if (id.indexOf('whenDark') > -1) {
                            currentMode = 'when_dark';
                            currentModeParams.enabled = states[this.namespace + '.meta.display.screensaver.modes.whenDark.enabled'].val;
                        }

                        this.buildRequest(
                            'device/display',
                            (content, status) => {
                                this.setState('meta.display.screensaver.enabled', {val: content.success.data.screensaver.enabled, ack: true});
                                this.setState('meta.display.screensaver.widget', {val: content.success.data.screensaver.widget, ack: true});
                                this.setState('meta.display.screensaver.modes.timeBased.enabled', {val: content.success.data.screensaver.modes.time_based.enabled, ack: true});
                                this.setState('meta.display.screensaver.modes.timeBased.startTime', {val: content.success.data.screensaver.modes.time_based.start_time, ack: true});
                                this.setState('meta.display.screensaver.modes.timeBased.endTime', {val: content.success.data.screensaver.modes.time_based.end_time, ack: true});
                                this.setState('meta.display.screensaver.modes.whenDark.enabled', {val: content.success.data.screensaver.modes.when_dark.enabled, ack: true});
                            },
                            'PUT',
                            {
                                screensaver: {
                                    enabled: screensaverState,
                                    mode: currentMode,
                                    mode_params: currentModeParams
                                }
                            }
                        );
                    }
                );
            } else if (id.match(/.+\.apps\.[a-z0-9]{32}\..*$/g)) {
                this.log.debug('changing to specific app');

                const matches = id.match(/.+\.apps\.([a-z0-9]{32})\.(.*)$/);
                const widget = matches[1];
                const action = matches[2];

                this.getState(
                    'apps.' + widget + '.package',
                    (err, state) => {
                        const pack = state.val;

                        if (action === 'activate') {
                            this.log.debug('activating specific widget: ' + widget + ' of package ' + pack);

                            this.buildRequest(
                                'device/apps/' + pack + '/widgets/' + widget + '/activate',
                                null,
                                'PUT',
                                null
                            );
                        } else {
                            this.log.debug('special action (' + action + '): ' + widget + ' of package ' + pack);

                            this.buildRequest(
                                'device/apps/' + pack + '/widgets/' + widget + '/actions',
                                null,
                                'POST',
                                {
                                    id: action
                                }
                            );
                        }
                    }
                );
            }
        }
    }

    /*
    {
      "priority": "[info|warning|critical]",
      "icon_type": "[none|info|alert]",
      "lifeTime": <milliseconds>,
      "model": {
       "frames": [
        {
           "icon": "<icon id or base64 encoded binary>",
           "text": "<text>"
        },
        {
          "icon": 298,
          "text": "text"
        },
        {
            "icon": 120,
            "goalData": {
                "start": 0,
                "current": 50,
                "end": 100,
                "unit": "%"
            }
        },
        {
            "chartData": [ <comma separated integer values> ]
        }
        ],
        "sound": {
          "category": "[alarms|notifications]",
            "id": "<sound_id>",
            "repeat": <repeat count>
        },
        "cycles": <cycle count>
      }
    }
    */

    onMessage(obj) {
        this.log.debug('received message ' + JSON.stringify(obj.message));

        if (obj && obj.message) {
            const data = {};

            if (obj.command === 'notification') {

                const notification = obj.message;

                if (notification.priority) {
                    data.priority = notification.priority; // Optional
                }

                if (notification.iconType) {
                    data.icon_type = notification.iconType; // Optional
                }

                if (notification.lifeTime) {
                    data.lifetime = notification.lifeTime; // Optional
                }

                const dataModel = {
                    frames: []
                };

                // Always create an array to make frame handling easier
                if (!Array.isArray(notification.text)) {
                    notification.text = [notification.text];
                }

                for (let i = 0; i < notification.text.length; i++) {
                    if (Array.isArray(notification.text[i])) {
                        const numberItems = notification.text[i].filter(item => (typeof item === "number"));

                        if (numberItems.length > 0) {
                            dataModel.frames.push({chartData: numberItems});
                        } else {
                            this.log.warn('Chart frames should contain numbers (other items are ignored)');
                        }
                    } else if (notification.text[i] !== null) {
                        const frame = {
                            text: notification.text[i]
                        };
    
                        if (notification.icon) {
                            frame.icon = notification.icon;
                        }
    
                        dataModel.frames.push(frame);
                    }
                }

                if (notification.sound) {
                    dataModel.sound = {
                        category: notification.sound.indexOf('alarm') > -1 ? 'alarms' : 'notifications',
                        id: notification.sound,
                        repeat: 1
                    };
                }

                if (notification.cycles) {
                    dataModel.cycles = notification.cycles; // Optional
                }

                data.model = dataModel;
            }

            this.buildRequest(
                'device/notifications',
                (content, status) => {
                    this.log.debug('Response: ' + JSON.stringify(content));
                    if (obj.callback) {
                        if (content && content.success) {
                            this.sendTo(obj.from, obj.command, content.success, obj.callback);
                        } else {
                            this.sendTo(obj.from, obj.command, {}, obj.callback);
                        }
                    }
                },
                'POST',
                data
            );

        }
    }

    refreshState() {
        this.log.debug('refreshing device state');

        this.buildRequest(
            'device',
            (content, status) => {
                this.setState('info.connection', true, true);

                this.setState('meta.name', {val: content.name, ack: true});
                this.setState('meta.serial', {val: content.serial_number, ack: true});
                this.setState('meta.version', {val: content.os_version, ack: true});
                this.setState('meta.model', {val: content.model, ack: true});
                this.setState('meta.mode', {val: content.mode, ack: true});

                this.setState('meta.audio.volume', {val: content.audio.volume, ack: true});
                this.setState('meta.audio.volumeMin', {val: content.audio.volume_limit.min, ack: true});
                this.setState('meta.audio.volumeMax', {val: content.audio.volume_limit.max, ack: true});

                this.setState('meta.bluetooth.available', {val: content.bluetooth.available, ack: true});
                this.setState('meta.bluetooth.name', {val: content.bluetooth.name, ack: true});
                this.setState('meta.bluetooth.active', {val: content.bluetooth.active, ack: true});
                this.setState('meta.bluetooth.discoverable', {val: content.bluetooth.discoverable, ack: true});
                this.setState('meta.bluetooth.pairable', {val: content.bluetooth.pairable, ack: true});
                this.setState('meta.bluetooth.address', {val: content.bluetooth.address, ack: true});

                this.setState('meta.wifi.active', {val: content.wifi.active, ack: true});
                this.setState('meta.wifi.address', {val: content.wifi.address, ack: true});
                this.setState('meta.wifi.available', {val: content.wifi.available, ack: true});
                this.setState('meta.wifi.encryption', {val: content.wifi.encryption, ack: true});
                this.setState('meta.wifi.ssid', {val: content.wifi.essid, ack: true});
                this.setState('meta.wifi.ip', {val: content.wifi.ip, ack: true});
                this.setState('meta.wifi.mode', {val: content.wifi.mode, ack: true});
                this.setState('meta.wifi.netmask', {val: content.wifi.netmask, ack: true});
                this.setState('meta.wifi.strength', {val: content.wifi.strength, ack: true});
            },
            'GET',
            null
        );

        this.buildRequest(
            'device/display',
            (content, status) => {
                this.setState('meta.display.brightness', {val: content.brightness, ack: true});
                this.setState('meta.display.brightnessMin', {val: content.brightness_limit.min, ack: true});
                this.setState('meta.display.brightnessMax', {val: content.brightness_limit.max, ack: true});
                this.setState('meta.display.brightnessAuto', {val: content.brightness_mode === 'auto', ack: true});
                this.setState('meta.display.brightnessMode', {val: content.brightness_mode, ack: true});

                this.setState('meta.display.width', {val: content.width, ack: true});
                this.setState('meta.display.height', {val: content.height, ack: true});
                this.setState('meta.display.type', {val: content.type, ack: true});

                this.setState('meta.display.screensaver.enabled', {val: content.screensaver.enabled, ack: true});
                this.setState('meta.display.screensaver.widget', {val: content.screensaver.widget, ack: true});
                this.setState('meta.display.screensaver.modes.timeBased.enabled', {val: content.screensaver.modes.time_based.enabled, ack: true});
                this.setState('meta.display.screensaver.modes.timeBased.startTime', {val: content.screensaver.modes.time_based.start_time, ack: true});
                this.setState('meta.display.screensaver.modes.timeBased.endTime', {val: content.screensaver.modes.time_based.end_time, ack: true});
                this.setState('meta.display.screensaver.modes.whenDark.enabled', {val: content.screensaver.modes.when_dark.enabled, ack: true});
            },
            'GET',
            null
        );

        this.log.debug('re-creating refresh state timeout');
        this.refreshStateTimeout = this.refreshStateTimeout || setTimeout(() => {
            this.refreshStateTimeout = null;
            this.refreshState();
        }, 60000);
    }

    refreshApps() {
        this.buildRequest(
            'device/apps',
            (content, status) => {
                const path = 'apps.';

                Object.keys(content).forEach(p => {
                    const pack = content[p];

                    Object.keys(pack.widgets).forEach(uuid => {
                        const widget = pack.widgets[uuid];

                        this.setObjectNotExists(path + uuid, {
                            type: 'channel',
                            common: {
                                name: 'Widget ' + pack.package + '(' + pack.version + ')',
                                role: ''
                            },
                            native: {}
                        });

                        this.setObjectNotExists(path + uuid + '.activate', {
                            type: 'state',
                            common: {
                                name: 'Activate',
                                type: 'boolean',
                                role: 'button',
                                read: false,
                                write: true
                            },
                            native: {}
                        });

                        this.setObjectNotExists(path + uuid + '.index', {
                            type: 'state',
                            common: {
                                name: 'Index',
                                type: 'number',
                                role: 'value',
                                read: true,
                                write: false
                            },
                            native: {}
                        });
                        this.setState(path + uuid + '.index', {val: widget.index, ack: true});

                        this.setObjectNotExists(path + uuid + '.package', {
                            type: 'state',
                            common: {
                                name: 'Package',
                                type: 'string',
                                role: 'value',
                                read: true,
                                write: false
                            },
                            native: {}
                        });
                        this.setState(path + uuid + '.package', {val: pack.package, ack: true});

                        this.setObjectNotExists(path + uuid + '.vendor', {
                            type: 'state',
                            common: {
                                name: 'Vendor',
                                type: 'string',
                                role: 'value',
                                read: true,
                                write: false
                            },
                            native: {}
                        });
                        this.setState(path + uuid + '.vendor', {val: pack.vendor, ack: true});

                        this.setObjectNotExists(path + uuid + '.version', {
                            type: 'state',
                            common: {
                                name: 'Vendor',
                                type: 'string',
                                role: 'value',
                                read: true,
                                write: false
                            },
                            native: {}
                        });
                        this.setState(path + uuid + '.version', {val: pack.version, ack: true});

                        // START special Widgets
                        if (pack.package === 'com.lametric.radio') {
                            this.setObjectNotExists(path + uuid + '.radio', {
                                type: 'channel',
                                common: {
                                    name: pack.package,
                                    role: ''
                                },
                                native: {}
                            });

                            this.setObjectNotExists(path + uuid + '.radio.play', {
                                type: 'state',
                                common: {
                                    name: 'Play Radio',
                                    type: 'boolean',
                                    role: 'button',
                                    read: false,
                                    write: true
                                },
                                native: {}
                            });

                            this.setObjectNotExists(path + uuid + '.radio.stop', {
                                type: 'state',
                                common: {
                                    name: 'Stop Radio',
                                    type: 'boolean',
                                    role: 'button',
                                    read: false,
                                    write: true
                                },
                                native: {}
                            });

                            this.setObjectNotExists(path + uuid + '.radio.next', {
                                type: 'state',
                                common: {
                                    name: 'Next Radio',
                                    type: 'boolean',
                                    role: 'button',
                                    read: false,
                                    write: true
                                },
                                native: {}
                            });

                            this.setObjectNotExists(path + uuid + '.radio.prev', {
                                type: 'state',
                                common: {
                                    name: 'Prev Radio',
                                    type: 'boolean',
                                    role: 'button',
                                    read: false,
                                    write: true
                                },
                                native: {}
                            });

                        } else if (pack.package === 'com.lametric.stopwatch') {

                            this.setObjectNotExists(path + uuid + '.stopwatch', {
                                type: 'channel',
                                common: {
                                    name: pack.package,
                                    role: ''
                                },
                                native: {}
                            });

                            this.setObjectNotExists(path + uuid + '.stopwatch.start', {
                                type: 'state',
                                common: {
                                    name: 'Start Stopwatch',
                                    type: 'boolean',
                                    role: 'button',
                                    read: false,
                                    write: true
                                },
                                native: {}
                            });

                            this.setObjectNotExists(path + uuid + '.stopwatch.pause', {
                                type: 'state',
                                common: {
                                    name: 'Pause Stopwatch',
                                    type: 'boolean',
                                    role: 'button',
                                    read: false,
                                    write: true
                                },
                                native: {}
                            });

                            this.setObjectNotExists(path + uuid + '.stopwatch.reset', {
                                type: 'state',
                                common: {
                                    name: 'Reset Stopwatch',
                                    type: 'boolean',
                                    role: 'button',
                                    read: false,
                                    write: true
                                },
                                native: {}
                            });

                        } else if (pack.package === 'com.lametric.weather') {

                            this.setObjectNotExists(path + uuid + '.weather', {
                                type: 'channel',
                                common: {
                                    name: pack.package,
                                    role: ''
                                },
                                native: {}
                            });

                            this.setObjectNotExists(path + uuid + '.weather.forecast', {
                                type: 'state',
                                common: {
                                    name: 'Weather Forecast',
                                    type: 'boolean',
                                    role: 'button',
                                    read: false,
                                    write: true
                                },
                                native: {}
                            });

                        } else if (pack.package === 'com.lametric.countdown') {

                            this.setObjectNotExists(path + uuid + '.countdown', {
                                type: 'channel',
                                common: {
                                    name: pack.package,
                                    role: ''
                                },
                                native: {}
                            });

                            this.setObjectNotExists(path + uuid + '.countdown.start', {
                                type: 'state',
                                common: {
                                    name: 'Countdown Start',
                                    type: 'boolean',
                                    role: 'button',
                                    read: false,
                                    write: true
                                },
                                native: {}
                            });

                            this.setObjectNotExists(path + uuid + '.countdown.pause', {
                                type: 'state',
                                common: {
                                    name: 'Countdown Pause',
                                    type: 'boolean',
                                    role: 'button',
                                    read: false,
                                    write: true
                                },
                                native: {}
                            });

                            this.setObjectNotExists(path + uuid + '.countdown.reset', {
                                type: 'state',
                                common: {
                                    name: 'Countdown Reset',
                                    type: 'boolean',
                                    role: 'button',
                                    read: false,
                                    write: true
                                },
                                native: {}
                            });

                        }

                        // END special Widgets
                    });
                });
            },
            'GET',
            null
        );

        this.log.debug('re-creating refresh app timeout');
        this.refreshAppTimeout = this.refreshAppTimeout || setTimeout(() => {
            this.refreshAppTimeout = null;
            this.refreshApps();
        }, 60000 * 60);
    }

    async buildRequest(service, callback, method, data) {
        const url = '/api/v2/' + service;
        const self = this;

        if (this.config.lametricIp && this.config.lametricToken) {
            this.log.debug('sending "' + method + '" request to "' + url + '" with data: ' + JSON.stringify(data));

            await axios({
                method: method,
                data: data,
                baseURL: 'http://' + this.config.lametricIp + ':8080',
                url: url,
                timeout: 2000,
                responseType: 'json',
                auth: {
                    username: 'dev',
                    password: this.config.lametricToken
                },
                validateStatus: function (status) {
                    return [200, 201].indexOf(status) > -1;
                },
            }).then(
                function (response) {
                    this.log.debug('received ' + response.status + ' response from ' + url + ' with content: ' + JSON.stringify(response.data));

                    if (response && callback && typeof callback === 'function') {
                        callback(response.data, response.status);
                    }
                }.bind(this)
            ).catch(
                function (error) {
                    if (error.response) {
                        // The request was made and the server responded with a status code
    
                        this.log.warn('received error ' + error.response.status + ' response from ' + url + ' with content: ' + JSON.stringify(error.response.data));
                    } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        this.log.info(error.message);

                        this.setState('info.connection', false, true);
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        this.log.error(error.message);

                        this.setState('info.connection', false, true);
                    }
                }.bind(this)
            );
        }
    }

    refreshMyDataDIY() {
        if (this.config.mydatadiy && Array.isArray(this.config.mydatadiy)) {
            this.log.debug('Collecting My Data (DIY) information');

            const frames = this.config.mydatadiy.map(f => {
                f.text = f.text.replace(
                    /\{([a-zA-Z0-9\.]+)\}/g,
                    (m, id) => {
                        this.log.debug('Replacing {' + id + '} in My Data (DIY) frame');

                        let replacedVal = '';
                        this.getForeignState(id, (err, state) => {
                            this.log.debug(JSON.stringify(state));
                            if (state) {
                                this.log.debug('Found replacement for {' + id + '}: ' + state.val);
                                replacedVal = state.val;
                            }
                        });
                        return replacedVal;
                    }
                );
                return f;
            });

            this.log.debug('Updating My Data (DIY) to ' + JSON.stringify(frames));

            this.setState('mydatadiy.obj', {val: {"frames": frames}, ack: true});

            this.log.debug('re-creating my data diy refresh timeout');
            this.refreshMyDataDiyTimeout = this.refreshMyDataDiyTimeout || setTimeout(() => {
                this.refreshMyDataDiyTimeout = null;
                this.refreshMyDataDIY();
            }, 10000);
        } else {
            this.log.debug('My Data (DIY) configuration is not available');
            this.setState('mydatadiy.obj', {val: {"frames": [{text: "No Data"}]}, ack: true});
        }
    }

    onUnload(callback) {
        try {
            this.setState('info.connection', false, true);

            if (this.refreshStateTimeout) {
                this.log.debug('clearing refresh state timeout');
                clearTimeout(this.refreshStateTimeout);
            }

            if (this.refreshAppTimeout) {
                this.log.debug('clearing refresh app timeout');
                clearTimeout(this.refreshAppTimeout);
            }

            if (this.refreshMyDataDiyTimeout) {
                this.log.debug('clearing refresh my data diy timeout');
                clearTimeout(this.refreshMyDataDiyTimeout);
            }

            callback();
        } catch (e) {
            callback();
        }
    }
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new LaMetric(options);
} else {
    // otherwise start the instance directly
    new LaMetric();
}