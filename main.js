/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

const utils = require('@iobroker/adapter-core');
const request = require('request');

class LaMetric extends utils.Adapter {

    constructor(options) {
        super({
            ...options,
            name: 'lametric',
        });

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        this.subscribeStates('*');

        // Refresh State every Minute
        this.refreshState();
        setInterval(this.refreshState.bind(this), 60000);

        // Refresh Apps every Hour
        this.refreshApps();
        setInterval(this.refreshApps.bind(this), 60000 * 60);
    }

    onStateChange(id, state) {
        if (id && state && !state.ack) {
            // No ack = changed by user
            if (id === this.namespace + '.meta.display.brightness') {
                this.log.debug('changing brightness to ' + state.val);

                this.buildRequest(
                    'device/display',
                    content => {
                        this.setState('meta.display.brightness', {val: content.success.data.brightness, ack: true});
                        this.setState('meta.display.brightnessAuto', {val: content.success.data.brightness_mode == 'auto', ack: true});
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
                    content => {
                        this.setState('meta.display.brightness', {val: content.success.data.brightness, ack: true});
                        this.setState('meta.display.brightnessAuto', {val: content.success.data.brightness_mode == 'auto', ack: true});
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
                    content => {
                        this.setState('meta.audio.volume', {val: content.success.data.volume, ack: true});
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
                    content => {
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
                    content => {
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
                    content => {},
                    'PUT',
                    null
                );
            } else if (id === this.namespace + '.apps.prev') {
                this.log.debug('changing to previous app');

                this.buildRequest(
                    'device/apps/prev',
                    content => {},
                    'PUT',
                    null
                );
            } else if (id.match(/.+\.apps\.[a-z0-9]{32}\.activate$/g)) {
                this.log.debug('changing to specific app');

                let matches = id.match(/.+\.apps\.([a-z0-9]{32})\.activate$/);
                let widget = matches[1];

                this.getState(
                    'apps.' + widget + '.package',
                    (err, state) => {
                        let pack = state.val;

                        this.log.debug('activating specific widget: ' + widget + ' of package ' + pack);

                        this.buildRequest(
                            'device/apps/' + pack + '/widgets/' + widget + '/activate',
                            content => {},
                            'PUT',
                            null
                        );
                    }
                );
            }
        }
    }

    onMessage(obj) {
        this.log.debug('received message ' + JSON.stringify(obj.message));

        if (obj && obj.message && obj.command === 'notification') {
            
            let notification = obj.message;
            var data = {};

            if (notification.priority) {
                data.priority = notification.priority; // Optional
            }

            if (notification.iconType) {
                data.icon_type = notification.iconType; // Optional
            }

            if (notification.lifeTime) {
                data.lifetime = notification.lifeTime; // Optional
            }

            var dataModel = {
                frames: []
            };

            if (!Array.isArray(notification.text)) {
                notification.text = [notification.text];
            }

            for (var i = 0; i < notification.text.length; i++) {
                if (notification.text[i] !== null) {
                    var frame = {
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

            if (notification.cycles) { // Optional
                dataModel.cycles = notification.cycles;
            }

            data.model = dataModel;

            this.buildRequest(
                'device/notifications',
                content => {
                    this.log.debug('Response: ' + JSON.stringify(content));
                    if (content && content.success) {
                        if (obj.callback) {
                            this.sendTo(obj.from, obj.command, content.success, obj.callback);
                        }
                    } else {
                        if (obj.callback) {
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
            content => {
                this.setState('info.connection', true, true);

                this.setState('meta.name', {val: content.name, ack: true});
                this.setState('meta.serial', {val: content.serial_number, ack: true});
                this.setState('meta.version', {val: content.os_version, ack: true});
                this.setState('meta.model', {val: content.model, ack: true});
                this.setState('meta.mode', {val: content.mode, ack: true});

                this.setState('meta.audio.volume', {val: content.audio.volume, ack: true});

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
            content => {
                this.setState('meta.display.brightness', {val: content.brightness, ack: true});
                this.setState('meta.display.brightnessAuto', {val: content.brightness_mode == 'auto', ack: true});
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
    }

    refreshApps() {
        this.buildRequest(
            'device/apps',
            content => {
                let path = 'apps.';

                for (var pack in content) {
                    var pack = content[pack];

                    for (var uuid in pack.widgets) {
                        var widget = pack.widgets[uuid];

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
                    }
                }
            },
            'GET',
            null
        );
    }

    buildRequest(service, callback, method, data) {
        if (this.config.lametricIp && this.config.lametricToken) {
            const url = 'http://' + this.config.lametricIp + ':8080/api/v2/' + service;

            this.log.debug('sending "' + method + '" request to "' + url + '" with data: ' + JSON.stringify(data));

            request(
                {
                    url: url,
                    method: method,
                    json: data ? data : true,
                    auth: {
                        user: 'dev',
                        pass: this.config.lametricToken,
                        sendImmediately: true
                    }
                },
                (error, response, content) => {
                    if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
                       callback(content);
                    } else if (error) {
                        this.log.error(error);
                    } else {
                        this.log.error('Status Code: ' + response.statusCode + ' / Content: ' + JSON.stringify(content));
                    }
                }
            );
        }
    }

    onUnload(callback) {
        try {
            this.setState('info.connection', false, true);

            this.log.debug('cleaned everything up...');
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