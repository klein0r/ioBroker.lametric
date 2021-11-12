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

        this.supportedVersion = "2.2.2";

        this.refreshStateTimeout = null;
        this.refreshAppTimeout = null;

        this.myDataDiyRegex = /\{([_a-zA-Z0-9\.#-]+)\}/g;
        this.myDataDiyForeignStates = [];

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        this.subscribeStates('*');

        this.refreshState();
        this.refreshApps();

        if (this.config.mydatadiy && Array.isArray(this.config.mydatadiy)) {
            this.collectMyDataDiyForeignStates(this.config.mydatadiy);
        } else {
            this.log.debug('My Data (DIY) configuration is not available');
            this.setState('mydatadiy.obj', {val: JSON.stringify({'frames': [{text: 'No Data', icon: 'a9335'}]}), ack: true});
        }
    }

    onStateChange(id, state) {
        if (id && state && this.myDataDiyForeignStates.filter(item => { return item.id === id; }).length > 0) {
            this.myDataDiyForeignStates = this.myDataDiyForeignStates.map(item => {
                if (item.id === id) {
                    this.log.debug('My Data (DIY) received new value "' + state.val + '" of state: ' + id);
                    item.val = state.val;
                }

                return item;
            });

            this.log.debug('My Data (DIY) list after value update ' + JSON.stringify(this.myDataDiyForeignStates));

            this.refreshMyDataDiy(); // Refresh Output
        }

        // Handle states of LaMetric adapter
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
                        this.setState('meta.display.screensaver.modes.timeBased.startTimeLocal', {val: content.success.data.screensaver.modes.time_based.local_start_time, ack: true});
                        this.setState('meta.display.screensaver.modes.timeBased.endTime', {val: content.success.data.screensaver.modes.time_based.end_time, ack: true});
                        this.setState('meta.display.screensaver.modes.timeBased.endTimeLocal', {val: content.success.data.screensaver.modes.time_based.local_end_time, ack: true});

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
                                this.setState('meta.display.screensaver.modes.timeBased.startTimeLocal', {val: content.success.data.screensaver.modes.time_based.local_start_time, ack: true});
                                this.setState('meta.display.screensaver.modes.timeBased.endTime', {val: content.success.data.screensaver.modes.time_based.end_time, ack: true});
                                this.setState('meta.display.screensaver.modes.timeBased.endTimeLocal', {val: content.success.data.screensaver.modes.time_based.local_end_time, ack: true});

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
                    (err, packState) => {
                        const pack = packState.val;

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

                            const data = { id: action };

                            // START special Widgets

                            if (action == 'clock.clockface') {

                                if (['weather', 'page_a_day', 'custom', 'none'].indexOf(state.val) > -1) {

                                    data.params = {
                                        type: state.val
                                    };

                                } else {

                                    data.params = {
                                        icon: state.val,
                                        type: 'custom'
                                    };

                                }

                                data.activate = true;

                                this.setState(id, {val: state.val, ack: true}); // Confirm state change

                            } else if (action == 'countdown.configure') {

                                data.params = {
                                    duration: state.val,
                                    start_now: false
                                };

                                this.setState(id, {val: state.val, ack: true}); // Confirm state change

                            }

                            // END special Widgets

                            this.buildRequest(
                                'device/apps/' + pack + '/widgets/' + widget + '/actions',
                                null,
                                'POST',
                                data
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
                        const numberItems = notification.text[i].filter(item => (typeof item === 'number'));

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

                if (this.isNewerVersion(content.os_version, this.supportedVersion)) {
                    this.log.warn("You should update your LaMetric Time - supported version of this adapter is " + this.supportedVersion + " (or later). Your current version is " + content.os_version);
                }

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

                this.setState('meta.bluetooth.low_energy.active', {val: content.bluetooth.low_energy.active, ack: true});
                this.setState('meta.bluetooth.low_energy.advertising', {val: content.bluetooth.low_energy.advertising, ack: true});
                this.setState('meta.bluetooth.low_energy.connectable', {val: content.bluetooth.low_energy.connectable, ack: true});

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
                this.setState('meta.display.screensaver.modes.timeBased.startTimeLocal', {val: content.screensaver.modes.time_based.local_start_time, ack: true});
                this.setState('meta.display.screensaver.modes.timeBased.endTime', {val: content.screensaver.modes.time_based.end_time, ack: true});
                this.setState('meta.display.screensaver.modes.timeBased.endTimeLocal', {val: content.screensaver.modes.time_based.local_end_time, ack: true});

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
                this.getChannelsOf(
                    'apps',
                    async (err, states) => {
                        const appsAll = [];
                        const appsKeep = [];

                        // Collect all apps
                        if (states) {
                            for (let i = 0; i < states.length; i++) {
                                const id = this.removeNamespace(states[i]._id);

                                // Check if the state is a direct child (e.g. apps.08b8eac21074f8f7e5a29f2855ba8060)
                                if (id.split('.').length === 2) {
                                    appsAll.push(id);
                                }
                            }
                        }

                        const path = 'apps.';

                        // Create new app structure
                        for (const p of Object.keys(content)) {
                            const pack = content[p];

                            for (const uuid of Object.keys(pack.widgets)) {
                                const widget = pack.widgets[uuid];

                                appsKeep.push(path + uuid);
                                this.log.debug('App found (keep): ' + path + uuid);

                                await this.setObjectNotExistsAsync(path + uuid, {
                                    type: 'channel',
                                    common: {
                                        name: 'Widget ' + pack.package + '(' + pack.version + ')',
                                        role: ''
                                    },
                                    native: {}
                                });

                                await this.setObjectNotExistsAsync(path + uuid + '.activate', {
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

                                await this.setObjectNotExistsAsync(path + uuid + '.index', {
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

                                await this.setObjectNotExistsAsync(path + uuid + '.package', {
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

                                await this.setObjectNotExistsAsync(path + uuid + '.vendor', {
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

                                await this.setObjectNotExistsAsync(path + uuid + '.version', {
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

                                if (pack.package === 'com.lametric.clock') {

                                    await this.setObjectNotExistsAsync(path + uuid + '.clock', {
                                        type: 'channel',
                                        common: {
                                            name: pack.package,
                                            role: ''
                                        },
                                        native: {}
                                    });

                                    await this.setObjectNotExistsAsync(path + uuid + '.clock.clockface', {
                                        type: 'state',
                                        common: {
                                            name: 'Clockface (Base64)',
                                            type: 'string',
                                            role: 'value',
                                            read: true,
                                            write: true
                                        },
                                        native: {}
                                    });

                                } else if (pack.package === 'com.lametric.radio') {

                                    await this.setObjectNotExistsAsync(path + uuid + '.radio', {
                                        type: 'channel',
                                        common: {
                                            name: pack.package,
                                            role: ''
                                        },
                                        native: {}
                                    });

                                    await this.setObjectNotExistsAsync(path + uuid + '.radio.play', {
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

                                    await this.setObjectNotExistsAsync(path + uuid + '.radio.stop', {
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

                                    await this.setObjectNotExistsAsync(path + uuid + '.radio.next', {
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

                                    await this.setObjectNotExistsAsync(path + uuid + '.radio.prev', {
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

                                    await this.setObjectNotExistsAsync(path + uuid + '.stopwatch', {
                                        type: 'channel',
                                        common: {
                                            name: pack.package,
                                            role: ''
                                        },
                                        native: {}
                                    });

                                    await this.setObjectNotExistsAsync(path + uuid + '.stopwatch.start', {
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

                                    await this.setObjectNotExistsAsync(path + uuid + '.stopwatch.pause', {
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

                                    await this.setObjectNotExistsAsync(path + uuid + '.stopwatch.reset', {
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

                                    await this.setObjectNotExistsAsync(path + uuid + '.weather', {
                                        type: 'channel',
                                        common: {
                                            name: pack.package,
                                            role: ''
                                        },
                                        native: {}
                                    });

                                    await this.setObjectNotExistsAsync(path + uuid + '.weather.forecast', {
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

                                    await this.setObjectNotExistsAsync(path + uuid + '.countdown', {
                                        type: 'channel',
                                        common: {
                                            name: pack.package,
                                            role: ''
                                        },
                                        native: {}
                                    });

                                    await this.setObjectNotExistsAsync(path + uuid + '.countdown.configure', {
                                        type: 'state',
                                        common: {
                                            name: 'Countdown Time (in seconds)',
                                            type: 'number',
                                            role: 'value',
                                            read: true,
                                            write: true
                                        },
                                        native: {}
                                    });

                                    await this.setObjectNotExistsAsync(path + uuid + '.countdown.start', {
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

                                    await this.setObjectNotExistsAsync(path + uuid + '.countdown.pause', {
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

                                    await this.setObjectNotExistsAsync(path + uuid + '.countdown.reset', {
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
                            }
                        }

                        // Delete non existent apps
                        for (let i = 0; i < appsAll.length; i++) {
                            const id = appsAll[i];

                            if (appsKeep.indexOf(id) === -1) {
                                this.delObject(id, {recursive: true}, () => {
                                    this.log.debug('App deleted: ' + id);
                                });
                            }
                        }
                    }
                );

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

        if (this.config.lametricIp && this.config.lametricToken) {
            this.log.debug('sending "' + method + '" request to "' + url + '" with data: ' + JSON.stringify(data));

            axios({
                method: method,
                data: data,
                baseURL: 'http://' + this.config.lametricIp + ':8080',
                url: url,
                timeout: 3000,
                responseType: 'json',
                auth: {
                    username: 'dev',
                    password: this.config.lametricToken
                },
                validateStatus: function (status) {
                    return [200, 201].indexOf(status) > -1;
                },
            }).then(
                (response) => {
                    this.log.debug('received ' + response.status + ' response from ' + url + ' with content: ' + JSON.stringify(response.data));

                    if (response && callback && typeof callback === 'function') {
                        callback(response.data, response.status);
                    }
                }
            ).catch(
                (error) => {
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
                }
            );
        }
    }

    async collectMyDataDiyForeignStates(frames) {
        this.log.debug('My Data (DIY) collecting states');

        const foreignStates = [];

        // Collect all IDs in texts
        frames.forEach(f => {
            f.text.replace(
                this.myDataDiyRegex,
                (m, id) => {
                    if (foreignStates.indexOf(id) === -1) {
                        this.log.debug('My Data (DIY) found dynamic state in text: ' + id);
                        foreignStates.push(id);
                    }
                }
            );

            f.icon.replace(
                this.myDataDiyRegex,
                (m, id) => {
                    if (foreignStates.indexOf(id) === -1) {
                        this.log.debug('My Data (DIY) found dynamic state in icon: ' + id);
                        foreignStates.push(id);
                    }
                }
            );
        });

        this.log.debug('My Data (DIY) found ' + foreignStates.length + ' dynamic states');

        Promise.all(
            foreignStates.map(
                async (id) => {
                    this.log.debug('My Data (DIY) subscribed to state: ' + id);
                    this.subscribeForeignStates(id);

                    const state = await this.getForeignStateAsync(id);

                    return new Promise((resolve) => {
                        if (state) {
                            this.log.debug('My Data (DIY) received value "' + state.val + '" of state: ' + id);
                            resolve(
                                {
                                    id: id,
                                    val: state.val
                                }
                            );
                        } else {
                            this.log.warn('Unable to get value of state: ' + id);
                            resolve(
                                {
                                    id: id,
                                    val: '<unknown ' + id + '>'
                                }
                            );
                        }
                    });
                }
            )
        ).then(data => {
            this.myDataDiyForeignStates = data;

            this.log.debug('My Data (DIY) found foreign states: ' + JSON.stringify(this.myDataDiyForeignStates));
            this.refreshMyDataDiy();
        });
    }

    async refreshMyDataDiy() {
        this.log.debug('My Data (DIY) refresh output state with config ' + JSON.stringify(this.config.mydatadiy));

        const clonedFrames = JSON.parse(JSON.stringify(this.config.mydatadiy)); // TODO: Better way to clone?!
        const newFrames = clonedFrames.map(f => {
            let replacedText = f.text.replace(
                this.myDataDiyRegex,
                (m, id) => {
                    this.log.debug('My Data (DIY) replacing {' + id + '} in frame text');

                    return this.myDataDiyForeignStates.filter(item => { return item.id === id; })[0].val;
                }
            );

            if (Object.prototype.hasOwnProperty.call(f, 'hideif')) {
                if (f.hideif && f.hideif == replacedText) {
                    this.log.debug('My Data (DIY) will remove frame because text matches configured hideif: "' + f.hideif + '"');
                    replacedText = ''; // Will be removed in filter function (see below)
                }
            }

            let newObj = {
                text: replacedText.trim()
            };

            if (f.icon) {
                newObj.icon = f.icon.replace(
                    this.myDataDiyRegex,
                    (m, id) => {
                        this.log.debug('My Data (DIY) replacing {' + id + '} in frame icon');

                        return this.myDataDiyForeignStates.filter(item => { return item.id === id; })[0].val;
                    }
                );
            }

            return newObj;
        }).filter(f => {
            if (f.text.length == 0) {
                this.log.debug('My Data (DIY) removed frame');
            }
            return f.text.length > 0;
        });

        this.log.debug('My Data (DIY) frame update to ' + JSON.stringify(newFrames));

        this.setState('mydatadiy.obj', {val: JSON.stringify({'frames': newFrames}), ack: true});
    }

    removeNamespace(id) {
        const re = new RegExp(this.namespace + '*\.', 'g');
        return id.replace(re, '');
    }

    onUnload(callback) {
        try {
            this.setState('info.connection', false, true);
            this.setState('mydatadiy.obj', {val: JSON.stringify({'frames': [{text: 'Adapter stopped', icon: 'a9335'}]}), ack: true});

            if (this.refreshStateTimeout) {
                this.log.debug('clearing refresh state timeout');
                clearTimeout(this.refreshStateTimeout);
            }

            if (this.refreshAppTimeout) {
                this.log.debug('clearing refresh app timeout');
                clearTimeout(this.refreshAppTimeout);
            }

            callback();
        } catch (e) {
            callback();
        }
    }

    isNewerVersion(oldVer, newVer) {
        const oldParts = oldVer.split('.');
        const newParts = newVer.split('.');
        for (var i = 0; i < newParts.length; i++) {
            const a = ~~newParts[i]; // parse int
            const b = ~~oldParts[i]; // parse int
            if (a > b) return true;
            if (a < b) return false;
        }
        return false;
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