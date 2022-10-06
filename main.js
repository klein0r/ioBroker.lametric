/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

const utils = require('@iobroker/adapter-core');
const axios = require('axios').default;
const https = require('https');
const adapterName = require('./package.json').name.split('.').pop();

class LaMetric extends utils.Adapter {
    constructor(options) {
        super({
            ...options,
            name: adapterName,
        });

        this.supportedVersion = '2.2.3';
        this.displayedVersionWarning = false;

        this.refreshStateTimeout = null;
        this.refreshAppTimeout = null;

        this.myDataDiyRegex = /\{([_a-zA-ZäÄüÜöÖ0-9.#-]+)\}/gu;
        this.myDataDiyForeignStates = [];

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        await this.subscribeStatesAsync('*');

        this.refreshState();
        this.refreshApps();

        if (this.config.mydatadiy && Array.isArray(this.config.mydatadiy)) {
            this.collectMyDataDiyForeignStates(this.config.mydatadiy);
        } else {
            this.log.debug('[mydatadiy] configuration not available');
            this.setStateAsync('mydatadiy.obj', { val: JSON.stringify({ frames: [{ text: 'No config', icon: 'a9335' }] }), ack: true });
        }
    }

    /**
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        // Check if changed (ack) state is in my data diy state list
        if (
            id &&
            state &&
            this.myDataDiyForeignStates.filter((item) => {
                return item.id === id;
            }).length > 0
        ) {
            if (state.ack) {
                this.myDataDiyForeignStates = this.myDataDiyForeignStates.map((item) => {
                    if (item.id === id) {
                        this.log.debug(`[mydatadiy] onStateChange - received new value "${state.val}" of state "${id}"`);
                        item.val = state.val;
                    }

                    return item;
                });

                this.log.debug(`[mydatadiy] onStateChange - list after value update ${JSON.stringify(this.myDataDiyForeignStates)}`);

                this.refreshMyDataDiy(); // refresh output
            } else {
                this.log.debug(`[mydatadiy] onStateChange - ignored new value "${state.val}" of state "${id}" (ack = false)`);
            }
        }

        // Handle states of LaMetric adapter
        if (id && state && !state.ack) {
            const idNoNamespace = this.removeNamespace(id);

            // No ack = changed by user
            if (idNoNamespace === 'meta.display.brightness') {
                this.log.debug(`changing brightness to ${state.val}`);

                this.buildRequest(
                    'device/display',
                    async (content) => {
                        await this.setStateChangedAsync('meta.display.brightness', { val: content.success.data.brightness, ack: true });
                        await this.setStateChangedAsync('meta.display.brightnessMin', { val: content.success.data.brightness_limit.min, ack: true });
                        await this.setStateChangedAsync('meta.display.brightnessMax', { val: content.success.data.brightness_limit.max, ack: true });
                        await this.setStateChangedAsync('meta.display.brightnessAuto', { val: content.success.data.brightness_mode === 'auto', ack: true });
                        await this.setStateChangedAsync('meta.display.brightnessMode', { val: content.success.data.brightness_mode, ack: true });
                    },
                    'PUT',
                    {
                        brightness: state.val,
                        brightness_mode: 'manual',
                    },
                );
            } else if (idNoNamespace === 'meta.display.brightnessAuto') {
                this.log.debug(`changing auto brightness mode to ${state.val}`);

                this.buildRequest(
                    'device/display',
                    async (content) => {
                        await this.setStateChangedAsync('meta.display.brightness', { val: content.success.data.brightness, ack: true });
                        await this.setStateChangedAsync('meta.display.brightnessMin', { val: content.success.data.brightness_limit.min, ack: true });
                        await this.setStateChangedAsync('meta.display.brightnessMax', { val: content.success.data.brightness_limit.max, ack: true });
                        await this.setStateChangedAsync('meta.display.brightnessAuto', { val: content.success.data.brightness_mode === 'auto', ack: true });
                        await this.setStateChangedAsync('meta.display.brightnessMode', { val: content.success.data.brightness_mode, ack: true });
                    },
                    'PUT',
                    {
                        brightness_mode: state.val ? 'auto' : 'manual',
                    },
                );
            } else if (idNoNamespace === 'meta.audio.volume') {
                this.log.debug(`changing volume to ${state.val}`);

                this.buildRequest(
                    'device/audio',
                    async (content) => {
                        await this.setStateChangedAsync('meta.audio.volume', { val: content.success.data.volume, ack: true });
                        await this.setStateChangedAsync('meta.audio.volumeMin', { val: content.success.data.volume_limit.min, ack: true });
                        await this.setStateChangedAsync('meta.audio.volumeMax', { val: content.success.data.volume_limit.max, ack: true });
                    },
                    'PUT',
                    {
                        volume: state.val,
                    },
                );
            } else if (idNoNamespace === 'meta.bluetooth.active') {
                this.log.debug(`changing bluetooth state to ${state.val}`);

                this.buildRequest(
                    'device/bluetooth',
                    async (content) => {
                        await this.setStateChangedAsync('meta.bluetooth.active', { val: content.success.data.active, ack: true });
                        await this.setStateChangedAsync('meta.bluetooth.available', { val: content.success.data.available, ack: true });
                        await this.setStateChangedAsync('meta.bluetooth.discoverable', { val: content.success.data.discoverable, ack: true });
                        await this.setStateChangedAsync('meta.bluetooth.address', { val: content.success.data.mac, ack: true });
                        await this.setStateChangedAsync('meta.bluetooth.name', { val: content.success.data.name, ack: true });
                        await this.setStateChangedAsync('meta.bluetooth.pairable', { val: content.success.data.pairable, ack: true });
                    },
                    'PUT',
                    {
                        active: state.val,
                    },
                );
            } else if (idNoNamespace === 'meta.bluetooth.name') {
                this.log.debug(`changing bluetooth name to ${state.val}`);

                this.buildRequest(
                    'device/bluetooth',
                    async (content) => {
                        await this.setStateChangedAsync('meta.bluetooth.active', { val: content.success.data.active, ack: true });
                        await this.setStateChangedAsync('meta.bluetooth.available', { val: content.success.data.available, ack: true });
                        await this.setStateChangedAsync('meta.bluetooth.discoverable', { val: content.success.data.discoverable, ack: true });
                        await this.setStateChangedAsync('meta.bluetooth.address', { val: content.success.data.mac, ack: true });
                        await this.setStateChangedAsync('meta.bluetooth.name', { val: content.success.data.name, ack: true });
                        await this.setStateChangedAsync('meta.bluetooth.pairable', { val: content.success.data.pairable, ack: true });
                    },
                    'PUT',
                    {
                        name: state.val,
                    },
                );
            } else if (idNoNamespace === 'apps.next') {
                this.log.debug('switching to next app');

                this.buildRequest('device/apps/next', null, 'PUT', null);
            } else if (idNoNamespace === 'apps.prev') {
                this.log.debug('switching to previous app');

                this.buildRequest('device/apps/prev', null, 'PUT', null);
            } else if (idNoNamespace === 'meta.display.screensaver.enabled') {
                this.log.debug(`changing screensaver state to ${state.val}`);

                this.buildRequest(
                    'device/display',
                    async (content) => {
                        await this.setStateChangedAsync('meta.display.screensaver.enabled', { val: content.success.data.screensaver.enabled, ack: true });
                        await this.setStateChangedAsync('meta.display.screensaver.widget', { val: content.success.data.screensaver.widget, ack: true });

                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.enabled', { val: content.success.data.screensaver.modes.time_based.enabled, ack: true });
                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.startTime', { val: content.success.data.screensaver.modes.time_based.start_time, ack: true });
                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.startTimeLocal', { val: content.success.data.screensaver.modes.time_based.local_start_time, ack: true });
                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.endTime', { val: content.success.data.screensaver.modes.time_based.end_time, ack: true });
                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.endTimeLocal', { val: content.success.data.screensaver.modes.time_based.local_end_time, ack: true });

                        await this.setStateChangedAsync('meta.display.screensaver.modes.whenDark.enabled', { val: content.success.data.screensaver.modes.when_dark.enabled, ack: true });
                    },
                    'PUT',
                    {
                        screensaver: {
                            enabled: state.val,
                        },
                    },
                );
            } else if (idNoNamespace.indexOf('meta.display.screensaver.modes.') === 0) {
                this.log.debug('changing screensaver settings');

                this.getStates('meta.display.screensaver.*', (err, states) => {
                    const screensaverEnabledState = states?.[`${this.namespace}.meta.display.screensaver.enabled`]?.val;
                    const currentModeParams = {};
                    let currentMode = 'when_dark';

                    if (idNoNamespace.indexOf('timeBased') > -1) {
                        currentMode = 'time_based';
                        currentModeParams.enabled = states?.[`${this.namespace}.meta.display.screensaver.modes.timeBased.enabled`]?.val ?? false;
                        currentModeParams.start_time = states?.[`${this.namespace}.meta.display.screensaver.modes.timeBased.startTime`]?.val ?? '23:00:00';
                        currentModeParams.end_time = states?.[`${this.namespace}.meta.display.screensaver.modes.timeBased.endTime`]?.val ?? '08:00:00';
                    } else if (idNoNamespace.indexOf('whenDark') > -1) {
                        currentMode = 'when_dark';
                        currentModeParams.enabled = states?.[`${this.namespace}.meta.display.screensaver.modes.whenDark.enabled`]?.val ?? false;
                    }

                    this.buildRequest(
                        'device/display',
                        async (content) => {
                            await this.setStateChangedAsync('meta.display.screensaver.enabled', { val: content.success.data.screensaver.enabled, ack: true });
                            await this.setStateChangedAsync('meta.display.screensaver.widget', { val: content.success.data.screensaver.widget, ack: true });

                            await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.enabled', { val: content.success.data.screensaver.modes.time_based.enabled, ack: true });
                            await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.startTime', { val: content.success.data.screensaver.modes.time_based.start_time, ack: true });
                            await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.startTimeLocal', { val: content.success.data.screensaver.modes.time_based.local_start_time, ack: true });
                            await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.endTime', { val: content.success.data.screensaver.modes.time_based.end_time, ack: true });
                            await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.endTimeLocal', { val: content.success.data.screensaver.modes.time_based.local_end_time, ack: true });

                            await this.setStateChangedAsync('meta.display.screensaver.modes.whenDark.enabled', { val: content.success.data.screensaver.modes.when_dark.enabled, ack: true });
                        },
                        'PUT',
                        {
                            screensaver: {
                                enabled: screensaverEnabledState ?? false,
                                mode: currentMode,
                                mode_params: currentModeParams,
                            },
                        },
                    );
                });
            } else if (id.match(/.+\.apps\.[a-z0-9]{32}\..*$/g)) {
                const matches = id.match(/.+\.apps\.([a-z0-9]{32})\.(.*)$/);
                const widget = matches[1];
                const action = matches[2];

                this.log.debug(`[widget] running action "${action}" on "${widget}"`);

                this.getState(`apps.${widget}.package`, async (err, packState) => {
                    if (!err && packState && typeof packState === 'object') {
                        const pack = packState.val;

                        if (action === 'activate') {
                            this.log.debug(`[widget] activating "${widget}" of package "${pack}"`);

                            this.buildRequest(`device/apps/${pack}/widgets/${widget}/activate`, null, 'PUT', null);
                        } else {
                            this.log.debug(`[widget] running special action "${action}" on "${widget}" of package "${pack}"`);

                            const data = { id: action };

                            // START special Widgets

                            if (action == 'clock.clockface') {
                                if (['weather', 'page_a_day', 'custom', 'none'].indexOf(state.val) > -1) {
                                    data.params = {
                                        type: state.val,
                                    };
                                } else {
                                    data.params = {
                                        icon: state.val,
                                        type: 'custom',
                                    };
                                }

                                data.activate = true;

                                await this.setStateAsync(idNoNamespace, { val: state.val, ack: true }); // Confirm state change
                            } else if (action.indexOf('clock.alarm') === 0) {
                                const caStates = await this.getStatesAsync(`apps.${widget}.clock.alarm.*`);

                                this.log.debug(`[widget] current clock.alarm states: ${JSON.stringify(caStates)}`);

                                const caEnabled = action === 'clock.alarm.enabled' ? state.val : caStates[`${this.namespace}.apps.${widget}.clock.alarm.enabled`]?.val;
                                const caTime = action === 'clock.alarm.time' ? state.val : caStates[`${this.namespace}.apps.${widget}.clock.alarm.time`]?.val;
                                const caWithRadio = action === 'clock.alarm.wake_with_radio' ? state.val : caStates[`${this.namespace}.apps.${widget}.clock.alarm.wake_with_radio`]?.val;

                                data.id = 'clock.alarm';
                                data.params = {
                                    enabled: caEnabled ?? false,
                                    time: caTime ?? '10:00:00',
                                    wake_with_radio: caWithRadio ?? false,
                                };

                                await this.setStateChangedAsync(`apps.${widget}.clock.alarm.enabled`, { val: data.params.enabled, ack: true });
                                await this.setStateChangedAsync(`apps.${widget}.clock.alarm.time`, { val: data.params.time, ack: true });
                                await this.setStateChangedAsync(`apps.${widget}.clock.alarm.wake_with_radio`, { val: data.params.wake_with_radio, ack: true });
                            } else if (action == 'countdown.configure') {
                                data.params = {
                                    duration: state.val,
                                    start_now: false,
                                };

                                await this.setStateAsync(idNoNamespace, { val: state.val, ack: true }); // Confirm state change
                            }

                            // END special Widgets

                            this.buildRequest(`device/apps/${pack}/widgets/${widget}/actions`, null, 'POST', data);
                        }
                    }
                });
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

    /**
     * @param {ioBroker.Message} obj
     */
    onMessage(obj) {
        this.log.debug(`[onMessage] received message: ${JSON.stringify(obj.message)}`);

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
                    frames: [],
                };

                // Always create an array to make frame handling easier
                if (!Array.isArray(notification.text)) {
                    notification.text = [notification.text];
                }

                for (let i = 0; i < notification.text.length; i++) {
                    if (Array.isArray(notification.text[i])) {
                        const numberItems = notification.text[i].filter((item) => typeof item === 'number');

                        if (numberItems.length > 0) {
                            dataModel.frames.push({ chartData: numberItems });
                        } else {
                            this.log.warn('Chart frames should contain numbers (other items are ignored)');
                        }
                    } else if (notification.text[i] !== null) {
                        const frame = {
                            text: notification.text[i],
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
                        repeat: 1,
                    };
                }

                if (notification.cycles) {
                    dataModel.cycles = notification.cycles; // Optional
                }

                data.model = dataModel;

                this.log.debug(`[onMessage] Notification data: ${JSON.stringify(data)}`);
            }

            this.buildRequest(
                'device/notifications',
                (content) => {
                    this.log.debug(`[onMessage] Response: ${JSON.stringify(content)}`);

                    if (obj.callback) {
                        if (content && content.success) {
                            this.sendTo(obj.from, obj.command, content.success, obj.callback);
                        } else {
                            this.sendTo(obj.from, obj.command, {}, obj.callback);
                        }
                    }
                },
                'POST',
                data,
            );
        }
    }

    refreshState() {
        this.log.debug('refreshing device state');

        this.buildRequest(
            'device',
            (content) => {
                this.setStateAsync('info.connection', { val: true, ack: true });

                if (this.isNewerVersion(content.os_version, this.supportedVersion) && !this.displayedVersionWarning) {
                    this.log.warn(`You should update your LaMetric Time - supported version of this adapter is ${this.supportedVersion} (or later). Your current version is ${content.os_version}`);
                    this.displayedVersionWarning = true; // Just show once
                }

                this.setStateChangedAsync('meta.name', { val: content.name, ack: true });
                this.setStateChangedAsync('meta.serial', { val: content.serial_number, ack: true });
                this.setStateChangedAsync('meta.version', { val: content.os_version, ack: true });
                this.setStateChangedAsync('meta.model', { val: content.model, ack: true });
                this.setStateChangedAsync('meta.mode', { val: content.mode, ack: true });

                this.setStateChangedAsync('meta.audio.volume', { val: content.audio.volume, ack: true });
                this.setStateChangedAsync('meta.audio.volumeMin', { val: content.audio.volume_limit.min, ack: true });
                this.setStateChangedAsync('meta.audio.volumeMax', { val: content.audio.volume_limit.max, ack: true });

                this.setStateChangedAsync('meta.bluetooth.available', { val: content.bluetooth.available, ack: true });
                this.setStateChangedAsync('meta.bluetooth.name', { val: content.bluetooth.name, ack: true });
                this.setStateChangedAsync('meta.bluetooth.active', { val: content.bluetooth.active, ack: true });
                this.setStateChangedAsync('meta.bluetooth.discoverable', { val: content.bluetooth.discoverable, ack: true });
                this.setStateChangedAsync('meta.bluetooth.pairable', { val: content.bluetooth.pairable, ack: true });
                this.setStateChangedAsync('meta.bluetooth.address', { val: content.bluetooth.address, ack: true });

                this.setStateChangedAsync('meta.bluetooth.low_energy.active', { val: content.bluetooth.low_energy.active, ack: true });
                this.setStateChangedAsync('meta.bluetooth.low_energy.advertising', { val: content.bluetooth.low_energy.advertising, ack: true });
                this.setStateChangedAsync('meta.bluetooth.low_energy.connectable', { val: content.bluetooth.low_energy.connectable, ack: true });

                this.setStateChangedAsync('meta.wifi.active', { val: content.wifi.active, ack: true });
                this.setStateChangedAsync('meta.wifi.address', { val: content.wifi.address, ack: true });
                this.setStateChangedAsync('meta.wifi.available', { val: content.wifi.available, ack: true });
                this.setStateChangedAsync('meta.wifi.encryption', { val: content.wifi.encryption, ack: true });
                this.setStateChangedAsync('meta.wifi.ssid', { val: content.wifi.essid, ack: true });
                this.setStateChangedAsync('meta.wifi.ip', { val: content.wifi.ip, ack: true });
                this.setStateChangedAsync('meta.wifi.mode', { val: content.wifi.mode, ack: true });
                this.setStateChangedAsync('meta.wifi.netmask', { val: content.wifi.netmask, ack: true });
                this.setStateChangedAsync('meta.wifi.strength', { val: content.wifi.strength, ack: true });
            },
            'GET',
            null,
        );

        this.buildRequest(
            'device/display',
            (content) => {
                this.setStateChangedAsync('meta.display.brightness', { val: content.brightness, ack: true });
                this.setStateChangedAsync('meta.display.brightnessMin', { val: content.brightness_limit.min, ack: true });
                this.setStateChangedAsync('meta.display.brightnessMax', { val: content.brightness_limit.max, ack: true });
                this.setStateChangedAsync('meta.display.brightnessAuto', { val: content.brightness_mode === 'auto', ack: true });
                this.setStateChangedAsync('meta.display.brightnessMode', { val: content.brightness_mode, ack: true });

                this.setStateChangedAsync('meta.display.width', { val: content.width, ack: true });
                this.setStateChangedAsync('meta.display.height', { val: content.height, ack: true });
                this.setStateChangedAsync('meta.display.type', { val: content.type, ack: true });

                this.setStateChangedAsync('meta.display.screensaver.enabled', { val: content.screensaver.enabled, ack: true });
                this.setStateChangedAsync('meta.display.screensaver.widget', { val: content.screensaver.widget, ack: true });

                this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.enabled', { val: content.screensaver.modes.time_based.enabled, ack: true });
                this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.startTime', { val: content.screensaver.modes.time_based.start_time, ack: true });
                this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.startTimeLocal', { val: content.screensaver.modes.time_based.local_start_time, ack: true });
                this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.endTime', { val: content.screensaver.modes.time_based.end_time, ack: true });
                this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.endTimeLocal', { val: content.screensaver.modes.time_based.local_end_time, ack: true });

                this.setStateChangedAsync('meta.display.screensaver.modes.whenDark.enabled', { val: content.screensaver.modes.when_dark.enabled, ack: true });
            },
            'GET',
            null,
        );

        this.log.debug('re-creating refresh state timeout');
        this.refreshStateTimeout =
            this.refreshStateTimeout ||
            setTimeout(() => {
                this.refreshStateTimeout = null;
                this.refreshState();
            }, 60000);
    }

    refreshApps() {
        this.buildRequest(
            'device/apps',
            (content) => {
                const appPath = 'apps';

                this.getChannelsOf(appPath, async (err, states) => {
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

                    // Create new app structure
                    for (const p of Object.keys(content)) {
                        const pack = content[p];

                        for (const uuid of Object.keys(pack.widgets)) {
                            const widget = pack.widgets[uuid];

                            appsKeep.push(`${appPath}.${uuid}`);
                            this.log.debug(`[apps] found (keep): ${appPath}.${uuid}`);

                            await this.setObjectNotExistsAsync(`${appPath}.${uuid}`, {
                                type: 'channel',
                                common: {
                                    name: `Widget ${pack.package} (${pack.version})`,
                                },
                                native: {},
                            });

                            await this.setObjectNotExistsAsync(`${appPath}.${uuid}.activate`, {
                                type: 'state',
                                common: {
                                    name: {
                                        en: 'Activate',
                                        de: 'Aktivieren',
                                        ru: 'Активировать',
                                        pt: 'Ativar',
                                        nl: 'Activeren',
                                        fr: 'Activer',
                                        it: 'Attivare',
                                        es: 'Activar',
                                        pl: 'Aktywuj',
                                        'zh-cn': '启用',
                                    },
                                    type: 'boolean',
                                    role: 'button',
                                    read: false,
                                    write: true,
                                },
                                native: {},
                            });

                            await this.setObjectNotExistsAsync(`${appPath}.${uuid}.index`, {
                                type: 'state',
                                common: {
                                    name: {
                                        en: 'Index',
                                        de: 'Index',
                                        ru: 'Показатель',
                                        pt: 'Índice',
                                        nl: 'Inhoudsopgave',
                                        fr: 'Indice',
                                        it: 'Indice',
                                        es: 'Índice',
                                        pl: 'Indeks',
                                        'zh-cn': '指数',
                                    },
                                    type: 'number',
                                    role: 'value',
                                    read: true,
                                    write: false,
                                },
                                native: {},
                            });
                            await this.setStateChangedAsync(`${appPath}.${uuid}.index`, { val: widget.index, ack: true });

                            await this.setObjectNotExistsAsync(`${appPath}.${uuid}.package`, {
                                type: 'state',
                                common: {
                                    name: {
                                        en: 'Package',
                                        de: 'Paket',
                                        ru: 'Упаковка',
                                        pt: 'Pacote',
                                        nl: 'Pakket',
                                        fr: 'Emballer',
                                        it: 'Pacchetto',
                                        es: 'Paquete',
                                        pl: 'Pakiet',
                                        'zh-cn': '包裹',
                                    },
                                    type: 'string',
                                    role: 'text',
                                    read: true,
                                    write: false,
                                },
                                native: {},
                            });
                            await this.setStateChangedAsync(`${appPath}.${uuid}.package`, { val: pack.package, ack: true });

                            await this.setObjectNotExistsAsync(`${appPath}.${uuid}.vendor`, {
                                type: 'state',
                                common: {
                                    name: {
                                        en: 'Vendor',
                                        de: 'Hersteller',
                                        ru: 'Продавец',
                                        pt: 'Fornecedor',
                                        nl: 'Leverancier',
                                        fr: 'Vendeur',
                                        it: 'Venditore',
                                        es: 'Vendedor',
                                        pl: 'Sprzedawca',
                                        'zh-cn': '小贩',
                                    },
                                    type: 'string',
                                    role: 'text',
                                    read: true,
                                    write: false,
                                },
                                native: {},
                            });
                            await this.setStateChangedAsync(`${appPath}.${uuid}.vendor`, { val: pack.vendor, ack: true });

                            await this.setObjectNotExistsAsync(`${appPath}.${uuid}.version`, {
                                type: 'state',
                                common: {
                                    name: {
                                        en: 'Version',
                                        de: 'Version',
                                        ru: 'Версия',
                                        pt: 'Versão',
                                        nl: 'Versie',
                                        fr: 'Version',
                                        it: 'Versione',
                                        es: 'Versión',
                                        pl: 'Wersja',
                                        'zh-cn': '版本',
                                    },
                                    type: 'string',
                                    role: 'text',
                                    read: true,
                                    write: false,
                                },
                                native: {},
                            });
                            await this.setStateChangedAsync(`${appPath}.${uuid}.version`, { val: pack.version, ack: true });

                            // START special Widgets

                            if (pack.package === 'com.lametric.clock') {
                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.clock`, {
                                    type: 'channel',
                                    common: {
                                        name: {
                                            en: 'Clock',
                                            de: 'Uhr',
                                            ru: 'Часы',
                                            pt: 'Relógio',
                                            nl: 'Klok',
                                            fr: 'Horloge',
                                            it: 'Orologio',
                                            es: 'Reloj',
                                            pl: 'Zegar',
                                            'zh-cn': '钟',
                                        },
                                    },
                                    native: {
                                        package: pack.package,
                                    },
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.clock.clockface`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Clockface (Base64)',
                                            de: 'Zifferblatt (Base64)',
                                            ru: 'Циферблат (Base64)',
                                            pt: 'Face do relógio (Base64)',
                                            nl: 'Wijzerplaat (Base64)',
                                            fr: "Cadran d'horloge (Base64)",
                                            it: 'Quadrante orologio (Base64)',
                                            es: 'Esfera de reloj (Base64)',
                                            pl: 'Tarcza zegara (Base64)',
                                            'zh-cn': '表盘 (Base64)',
                                        },
                                        type: 'string',
                                        role: 'state',
                                        read: true,
                                        write: true,
                                    },
                                    native: {},
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.clock.alarm`, {
                                    type: 'channel',
                                    common: {
                                        name: {
                                            en: 'Alarm',
                                            de: 'Alarm',
                                            ru: 'Тревога',
                                            pt: 'Alarme',
                                            nl: 'Alarm',
                                            fr: 'Alarme',
                                            it: 'Allarme',
                                            es: 'Alarma',
                                            pl: 'Alarm',
                                            'zh-cn': '警报',
                                        },
                                    },
                                    native: {},
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.clock.alarm.enabled`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Alarm Enabled',
                                            de: 'Alarm aktiviert',
                                            ru: 'Тревога включена',
                                            pt: 'Alarme Habilitado',
                                            nl: 'Alarm ingeschakeld',
                                            fr: 'Alarme activée',
                                            it: 'Allarme abilitato',
                                            es: 'Alarma habilitada',
                                            pl: 'Alarm włączony',
                                            'zh-cn': '警报已启用',
                                        },
                                        type: 'boolean',
                                        role: 'switch.enable',
                                        read: true,
                                        write: true,
                                    },
                                    native: {},
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.clock.alarm.time`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Alarm Time',
                                            de: 'Weckzeit',
                                            ru: 'Время будильника',
                                            pt: 'Hora do alarme',
                                            nl: 'Alarm tijd',
                                            fr: "Heure de l'alarme",
                                            it: 'Ora della sveglia',
                                            es: 'Hora de alarma',
                                            pl: 'Czas alarmu',
                                            'zh-cn': '闹钟时间',
                                        },
                                        type: 'string',
                                        role: 'state',
                                        read: true,
                                        write: true,
                                    },
                                    native: {},
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.clock.alarm.wake_with_radio`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'with Radio',
                                            de: 'mit Radio',
                                            ru: 'с радио',
                                            pt: 'com rádio',
                                            nl: 'met radio',
                                            fr: 'avec radio',
                                            it: 'con Radio',
                                            es: 'con radio',
                                            pl: 'z radiem',
                                            'zh-cn': '带收音机',
                                        },
                                        type: 'boolean',
                                        role: 'switch.enable',
                                        read: true,
                                        write: true,
                                    },
                                    native: {},
                                });
                            } else if (pack.package === 'com.lametric.radio') {
                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.radio`, {
                                    type: 'channel',
                                    common: {
                                        name: {
                                            en: 'Radio',
                                            de: 'Radio',
                                            ru: 'Радио',
                                            pt: 'Rádio',
                                            nl: 'Radio',
                                            fr: 'Radio',
                                            it: 'Radio',
                                            es: 'Radio',
                                            pl: 'Radio',
                                            'zh-cn': '收音机',
                                        },
                                    },
                                    native: {
                                        package: pack.package,
                                    },
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.radio.play`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Play Radio',
                                            de: 'Radio starten',
                                            ru: 'Слушать радио',
                                            pt: 'Tocar rádio',
                                            nl: 'Radio afspelen',
                                            fr: 'Écouter la radio',
                                            it: 'Riproduci radio',
                                            es: 'Reproducir radio',
                                            pl: 'Włącz radio',
                                            'zh-cn': '播放广播',
                                        },
                                        type: 'boolean',
                                        role: 'button',
                                        read: false,
                                        write: true,
                                    },
                                    native: {},
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.radio.stop`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Stop Radio',
                                            de: 'Radio stoppen',
                                            ru: 'Остановить радио',
                                            pt: 'Parar Rádio',
                                            nl: 'Radio stoppen',
                                            fr: 'Arrêter la radio',
                                            it: 'Ferma la radio',
                                            es: 'Detener radio',
                                            pl: 'Zatrzymaj radio',
                                            'zh-cn': '停止广播',
                                        },
                                        type: 'boolean',
                                        role: 'button',
                                        read: false,
                                        write: true,
                                    },
                                    native: {},
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.radio.next`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Next Radio',
                                            de: 'Nächstes Radio',
                                            ru: 'Следующее радио',
                                            pt: 'Next Radio',
                                            nl: 'volgende radio',
                                            fr: 'Radio suivante',
                                            it: 'Prossima Radio',
                                            es: 'Siguiente radio',
                                            pl: 'Następne radio',
                                            'zh-cn': '下一个电台',
                                        },
                                        type: 'boolean',
                                        role: 'button',
                                        read: false,
                                        write: true,
                                    },
                                    native: {},
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.radio.prev`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Previous Radio',
                                            de: 'Vorheriges Radio',
                                            ru: 'Предыдущее радио',
                                            pt: 'Rádio Anterior',
                                            nl: 'Vorige radio',
                                            fr: 'Radio précédente',
                                            it: 'Radio precedente',
                                            es: 'Radio anterior',
                                            pl: 'Poprzednie radio',
                                            'zh-cn': '以前的电台',
                                        },
                                        type: 'boolean',
                                        role: 'button',
                                        read: false,
                                        write: true,
                                    },
                                    native: {},
                                });
                            } else if (pack.package === 'com.lametric.stopwatch') {
                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.stopwatch`, {
                                    type: 'channel',
                                    common: {
                                        name: {
                                            en: 'Stopwatch',
                                            de: 'Stoppuhr',
                                            ru: 'Секундомер',
                                            pt: 'Cronômetro',
                                            nl: 'Stopwatch',
                                            fr: 'Chronomètre',
                                            it: 'Cronometro',
                                            es: 'Cronógrafo',
                                            pl: 'Stoper',
                                            'zh-cn': '跑表',
                                        },
                                    },
                                    native: {
                                        package: pack.package,
                                    },
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.stopwatch.start`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Start Stopwatch',
                                            de: 'Stoppuhr starten',
                                            ru: 'Запустить секундомер',
                                            pt: 'Iniciar cronômetro',
                                            nl: 'Stopwatch starten',
                                            fr: 'Démarrer le chronomètre',
                                            it: 'Avvia cronometro',
                                            es: 'Iniciar cronómetro',
                                            pl: 'Uruchom stoper',
                                            'zh-cn': '启动秒表',
                                        },
                                        type: 'boolean',
                                        role: 'button',
                                        read: false,
                                        write: true,
                                    },
                                    native: {},
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.stopwatch.pause`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Pause Stopwatch',
                                            de: 'Stoppuhr pausieren',
                                            ru: 'Пауза секундомера',
                                            pt: 'Pausar cronômetro',
                                            nl: 'Stopwatch pauzeren',
                                            fr: 'Suspendre le chronomètre',
                                            it: 'Metti in pausa il cronometro',
                                            es: 'Pausar cronómetro',
                                            pl: 'Wstrzymaj stoper',
                                            'zh-cn': '暂停秒表',
                                        },
                                        type: 'boolean',
                                        role: 'button',
                                        read: false,
                                        write: true,
                                    },
                                    native: {},
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.stopwatch.reset`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Reset Stopwatch',
                                            de: 'Stoppuhr zurücksetzen',
                                            ru: 'Сбросить секундомер',
                                            pt: 'Reiniciar cronômetro',
                                            nl: 'Stopwatch resetten',
                                            fr: 'Réinitialiser le chronomètre',
                                            it: 'Ripristina cronometro',
                                            es: 'Restablecer cronómetro',
                                            pl: 'Zresetuj stoper',
                                            'zh-cn': '重置秒表',
                                        },
                                        type: 'boolean',
                                        role: 'button',
                                        read: false,
                                        write: true,
                                    },
                                    native: {},
                                });
                            } else if (pack.package === 'com.lametric.weather') {
                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.weather`, {
                                    type: 'channel',
                                    common: {
                                        name: {
                                            en: 'Weather',
                                            de: 'Wetter',
                                            ru: 'Погода',
                                            pt: 'Clima',
                                            nl: 'Weer',
                                            fr: "La'météo",
                                            it: "Tempo'metereologico",
                                            es: 'Clima',
                                            pl: 'Pogoda',
                                            'zh-cn': '天气',
                                        },
                                    },
                                    native: {
                                        package: pack.package,
                                    },
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.weather.forecast`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Weather Forecast',
                                            de: 'Wettervorhersage',
                                            ru: 'Прогноз погоды',
                                            pt: 'Previsão do tempo',
                                            nl: 'Weervoorspelling',
                                            fr: 'Prévisions météorologiques',
                                            it: 'Previsioni del tempo',
                                            es: 'Pronóstico del tiempo',
                                            pl: 'Prognoza pogody',
                                            'zh-cn': '天气预报',
                                        },
                                        type: 'boolean',
                                        role: 'button',
                                        read: false,
                                        write: true,
                                    },
                                    native: {},
                                });
                            } else if (pack.package === 'com.lametric.countdown') {
                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.countdown`, {
                                    type: 'channel',
                                    common: {
                                        name: {
                                            en: 'Countdown',
                                            de: 'Countdown',
                                            ru: 'Обратный отсчет',
                                            pt: 'Contagem regressiva',
                                            nl: 'Aftellen',
                                            fr: 'Compte à rebours',
                                            it: 'Conto alla rovescia',
                                            es: 'cuenta regresiva',
                                            pl: 'Odliczanie',
                                            'zh-cn': '倒数',
                                        },
                                    },
                                    native: {
                                        package: pack.package,
                                    },
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.countdown.configure`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Countdown Time',
                                            de: 'Countdown-Zeit',
                                            ru: 'Обратный отсчет',
                                            pt: 'Tempo de contagem regressiva',
                                            nl: 'Afteltijd',
                                            fr: 'Temps de compte à rebours',
                                            it: 'Conto alla rovescia',
                                            es: 'Tiempo de cuenta regresiva',
                                            pl: 'Czas odliczania',
                                            'zh-cn': '倒计时时间',
                                        },
                                        type: 'number',
                                        role: 'value',
                                        read: true,
                                        write: true,
                                    },
                                    native: {},
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.countdown.start`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Countdown Start',
                                            de: 'Countdown-Start',
                                            ru: 'Обратный отсчет',
                                            pt: 'Início da contagem regressiva',
                                            nl: 'Aftellen starten',
                                            fr: 'Début du compte à rebours',
                                            it: 'Inizio conto alla rovescia',
                                            es: 'Inicio de la cuenta regresiva',
                                            pl: 'Rozpoczęcie odliczania',
                                            'zh-cn': '倒计时开始',
                                        },
                                        type: 'boolean',
                                        role: 'button',
                                        read: false,
                                        write: true,
                                    },
                                    native: {},
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.countdown.pause`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Countdown Pause',
                                            de: 'Countdown-Pause',
                                            ru: 'Обратный отсчет Пауза',
                                            pt: 'Pausa de contagem regressiva',
                                            nl: 'Aftellen pauze',
                                            fr: 'Pause du compte à rebours',
                                            it: 'Pausa conto alla rovescia',
                                            es: 'Pausa de cuenta regresiva',
                                            pl: 'Pauza odliczania',
                                            'zh-cn': '倒计时暂停',
                                        },
                                        type: 'boolean',
                                        role: 'button',
                                        read: false,
                                        write: true,
                                    },
                                    native: {},
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${uuid}.countdown.reset`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Countdown Reset',
                                            de: 'Countdown-Reset',
                                            ru: 'Обратный отсчет Сброс',
                                            pt: 'Reinicialização da contagem regressiva',
                                            nl: 'Aftellen resetten',
                                            fr: 'Réinitialisation du compte à rebours',
                                            it: 'Ripristino conto alla rovescia',
                                            es: 'Reinicio de la cuenta regresiva',
                                            pl: 'Resetowanie odliczania',
                                            'zh-cn': '倒计时重置',
                                        },
                                        type: 'boolean',
                                        role: 'button',
                                        read: false,
                                        write: true,
                                    },
                                    native: {},
                                });
                            }

                            // END special Widgets
                        }
                    }

                    // Delete non existent apps
                    for (let i = 0; i < appsAll.length; i++) {
                        const id = appsAll[i];

                        if (appsKeep.indexOf(id) === -1) {
                            await this.delObjectAsync(id, { recursive: true });
                            this.log.debug(`[apps] deleted: ${id}`);
                        }
                    }
                });
            },
            'GET',
            null,
        );

        this.log.debug('[apps] re-creating refresh timeout');
        this.refreshAppTimeout =
            this.refreshAppTimeout ||
            setTimeout(() => {
                this.refreshAppTimeout = null;
                this.refreshApps();
            }, 60000 * 60);
    }

    async buildRequest(service, callback, method, data) {
        const url = `/api/v2/${service}`;

        if (this.config.lametricIp && this.config.lametricToken) {
            const prefix = this.config.useHttps ? 'https' : 'http';
            const port = this.config.useHttps ? 4343 : 8080;

            this.log.debug(`sending "${method}" request to "${url}" with ${prefix} on port ${port} with data: ${JSON.stringify(data)}`);

            axios({
                method: method,
                data: data,
                baseURL: `${prefix}://${this.config.lametricIp}:${port}`,
                url: url,
                timeout: 3000,
                responseType: 'json',
                auth: {
                    username: 'dev',
                    password: this.config.lametricToken,
                },
                validateStatus: function (status) {
                    return [200, 201].indexOf(status) > -1;
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            })
                .then((response) => {
                    this.log.debug(`received ${response.status} response from "${url}" with content: ${JSON.stringify(response.data)}`);

                    if (response && callback && typeof callback === 'function') {
                        callback(response.data, response.status);
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        // The request was made and the server responded with a status code

                        this.log.warn(`received error ${error.response.status} response from "${url}" with content: ${JSON.stringify(error.response.data)}`);
                    } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        this.log.info(error.message);

                        this.setStateAsync('info.connection', { val: false, ack: true });
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        this.log.error(error.message);

                        this.setStateAsync('info.connection', { val: false, ack: true });
                    }
                });
        }
    }

    async collectMyDataDiyForeignStates(frames) {
        this.log.debug('[mydatadiy] collecting states');

        const foreignStates = [];

        // Collect all IDs in texts
        frames.forEach((f) => {
            f.text.replace(this.myDataDiyRegex, (m, id) => {
                if (foreignStates.indexOf(id) === -1) {
                    this.log.debug(`[mydatadiy] found dynamic state in text with id "${id}"`);
                    foreignStates.push(id);
                }
            });

            f.icon.replace(this.myDataDiyRegex, (m, id) => {
                if (foreignStates.indexOf(id) === -1) {
                    this.log.debug(`[mydatadiy] found dynamic state in icon with id "${id}"`);
                    foreignStates.push(id);
                }
            });
        });

        this.log.debug(`[mydatadiy] found ${foreignStates.length} dynamic states: ${JSON.stringify(foreignStates)}`);

        Promise.all(
            foreignStates.map(async (id) => {
                this.subscribeForeignStates(id);
                this.log.debug(`[mydatadiy] subscribed to foreign state "${id}"`);

                const state = await this.getForeignStateAsync(id);

                return new Promise((resolve) => {
                    if (state) {
                        this.log.debug(`[mydatadiy] received value "${state.val}" of state "${id}"`);
                        resolve({
                            id: id,
                            val: state.val,
                        });
                    } else {
                        this.log.warn(`[mydatadiy] unable to get value of state "${id}"`);
                        resolve({
                            id: id,
                            val: `<unknown ${id}>`,
                        });
                    }
                });
            }),
        ).then((data) => {
            this.myDataDiyForeignStates = data;

            this.log.debug(`[mydatadiy] found foreign states: ${JSON.stringify(this.myDataDiyForeignStates)}`);
            this.refreshMyDataDiy();
        });
    }

    async refreshMyDataDiy() {
        this.log.debug(`[mydatadiy] refresh output state with config: ${JSON.stringify(this.config.mydatadiy)}`);

        const clonedFrames = JSON.parse(JSON.stringify(this.config.mydatadiy)); // TODO: Better way to clone?!
        const newFrames = clonedFrames
            .map((f) => {
                let replacedText = f.text.replace(this.myDataDiyRegex, (m, id) => {
                    const newVal = this.myDataDiyForeignStates.filter((item) => {
                        return item.id === id;
                    })[0].val;

                    this.log.debug(`[mydatadiy] replacing "${id}" in frame text with "${newVal}"`);

                    return newVal;
                });

                if (Object.prototype.hasOwnProperty.call(f, 'hideif')) {
                    if (f.hideif && f.hideif == replacedText) {
                        this.log.debug(`[mydatadiy] removing frame because text matches configured hideif: "${f.hideif}"`);
                        replacedText = ''; // will be removed in filter function (see below)
                    }
                }

                const newObj = {
                    text: replacedText.trim(),
                    duration: f?.duration ?? 5,
                };

                if (f.icon) {
                    newObj.icon = f.icon.replace(this.myDataDiyRegex, (m, id) => {
                        const newVal = this.myDataDiyForeignStates.filter((item) => {
                            return item.id === id;
                        })[0].val;

                        this.log.debug(`[mydatadiy] replacing "${id}" in frame text with "${newVal}"`);

                        return newVal;
                    });
                }

                return newObj;
            })
            .filter((f) => {
                if (f.text.length == 0) {
                    this.log.debug(`[mydatadiy] removed frame with empty text`);
                }
                return f.text.length > 0;
            });

        this.log.debug(`[mydatadiy] completed - frame update to ${JSON.stringify(newFrames)}`);

        this.setStateAsync('mydatadiy.obj', { val: JSON.stringify({ frames: newFrames }), ack: true });
    }

    removeNamespace(id) {
        const re = new RegExp(this.namespace + '*\\.', 'g');
        return id.replace(re, '');
    }

    /**
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            this.setStateAsync('info.connection', { val: false, ack: true });
            this.setStateAsync('mydatadiy.obj', { val: JSON.stringify({ frames: [{ text: 'Adapter stopped', icon: 'a9335' }] }), ack: true });

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
        for (let i = 0; i < newParts.length; i++) {
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
