'use strict';

const utils = require('@iobroker/adapter-core');
const axios = require('axios').default;
const https = require('node:https');
const adapterName = require('./package.json').name.split('.').pop();

const MY_DATA_DIY_PACKAGE = 'com.lametric.diy.devwidget';

class LaMetric extends utils.Adapter {
    constructor(options) {
        super({
            ...options,
            name: adapterName,
        });

        this.displayedVersionWarning = false;
        this.supportedApiVersion = '2.0.0';
        this.supportedVersions = {
            'LM 37X8': '2.3.9', // https://firmware.lametric.com
            sa8: '3.1.4', // https://firmware.lametric.com/?product=time2
        };

        this.supportsStreaming = false;

        this.prefix = 'http';
        this.port = 8080;

        this.apiConnected = false;
        this.refreshStateTimeout = null;
        this.refreshAppTimeout = null;

        this.myDataDiyApp = null;
        this.myDataDiyRegex = /\{([_:a-zA-ZäÄüÜöÖ0-9.#-]+)\}/gu;
        this.myDataDiyForeignStates = [];
        this.myDataDiyNumberStates = [];

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        try {
            await this.setApiConnected(false);
            await this.subscribeStatesAsync('*');

            if (!this.config.lametricIp || !this.config.lametricToken) {
                this.log.error(
                    `IP address and/or token not configured - please check instance configuration and restart`,
                );
                typeof this.terminate === 'function' ? this.terminate(11) : process.exit(11);
                return;
            }
            if (this.config.useHttps) {
                this.prefix = 'https';
                this.port = 4343;
            }

            this.log.info(`Starting - connecting to ${this.prefix}://${this.config.lametricIp}:${this.port}`);

            await this.refreshState();

            if (this.config.mydatadiy && Array.isArray(this.config.mydatadiy)) {
                this.collectMyDataDiyForeignStates(this.config.mydatadiy);
            } else {
                this.log.info('[mydatadiy] configuration not available - skipping');
                await this.setState('mydatadiy.obj', {
                    val: JSON.stringify({ frames: [{ text: 'No config', icon: 'a9335' }] }),
                    ack: true,
                });
            }
        } catch (err) {
            this.log.error(`Error on startup: ${err}`);
            typeof this.terminate === 'function' ? this.terminate(11) : process.exit(11);
            return;
        }
    }

    /**
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    async onStateChange(id, state) {
        // Check if changed state is in MyDataDIY state list
        if (id && this.myDataDiyForeignStates.filter(item => item.id === id).length > 0) {
            if (state) {
                if (state.ack) {
                    this.myDataDiyForeignStates = this.myDataDiyForeignStates.map(item => {
                        if (item.id === id) {
                            this.log.debug(
                                `[mydatadiy] onStateChange - received new value "${state.val}" of state "${id}"`,
                            );
                            item.val = this.formatMyDataDiyValue(id, state.val);
                        }

                        return item;
                    });
                } else {
                    this.log.debug(
                        `[mydatadiy] onStateChange - ignored value "${state.val}" of state "${id}" (ack = false)`,
                    );
                }
            } else {
                // State deleted
                this.myDataDiyForeignStates = this.myDataDiyForeignStates.map(item => {
                    if (item.id === id) {
                        this.log.debug(`[mydatadiy] onStateChange - state "${id}" has been deleted`);
                        item.val = this.formatMyDataDiyValue(id, `<deleted ${id}>`);
                    }

                    return item;
                });
            }

            this.log.debug(
                `[mydatadiy] onStateChange - list after value update ${JSON.stringify(this.myDataDiyForeignStates)}`,
            );

            await this.refreshMyDataDiy();
        }

        // Handle states of LaMetric adapter
        if (id && state && !state.ack) {
            const idNoNamespace = this.removeNamespace(id);

            // No ack = changed by user
            if (idNoNamespace === 'meta.mode') {
                this.log.debug(`changing device mode to ${state.val}`);

                this.buildRequestAsync('device', 'PUT', { mode: state.val })
                    .then(async response => {
                        const content = response.data;
                        await this.setStateChangedAsync('meta.mode', { val: content.success.data.mode, ack: true });
                    })
                    .catch(error => {
                        this.log.warn(`(device) Unable to execute action: ${error}`);
                    });
            } else if (idNoNamespace === 'meta.display.brightness') {
                this.log.debug(`changing brightness to ${state.val}`);

                this.buildRequestAsync('device/display', 'PUT', { brightness: state.val, brightness_mode: 'manual' })
                    .then(async response => {
                        const content = response.data;

                        await this.setStateChangedAsync('meta.display.brightness', {
                            val: content.success.data.brightness,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.brightnessMin', {
                            val: content.success.data.brightness_limit.min,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.brightnessMax', {
                            val: content.success.data.brightness_limit.max,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.brightnessAuto', {
                            val: content.success.data.brightness_mode === 'auto',
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.brightnessMode', {
                            val: content.success.data.brightness_mode,
                            ack: true,
                        });
                    })
                    .catch(error => {
                        this.log.warn(`(device/display) Unable to execute action: ${error}`);
                    });
            } else if (idNoNamespace === 'meta.display.brightnessAuto') {
                this.log.debug(`changing auto brightness mode to ${state.val}`);

                this.buildRequestAsync('device/display', 'PUT', { brightness_mode: state.val ? 'auto' : 'manual' })
                    .then(async response => {
                        const content = response.data;

                        await this.setStateChangedAsync('meta.display.brightness', {
                            val: content.success.data.brightness,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.brightnessMin', {
                            val: content.success.data.brightness_limit.min,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.brightnessMax', {
                            val: content.success.data.brightness_limit.max,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.brightnessAuto', {
                            val: content.success.data.brightness_mode === 'auto',
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.brightnessMode', {
                            val: content.success.data.brightness_mode,
                            ack: true,
                        });
                    })
                    .catch(error => {
                        this.log.warn(`(device/display) Unable to execute action: ${error}`);
                    });
            } else if (idNoNamespace === 'meta.audio.volume') {
                this.log.debug(`changing volume to ${state.val}`);

                this.buildRequestAsync('device/audio', 'PUT', { volume: state.val })
                    .then(async response => {
                        const content = response.data;

                        await this.setStateChangedAsync('meta.audio.volume', {
                            val: content.success.data.volume,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.audio.volumeMin', {
                            val: content.success.data.volume_limit.min,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.audio.volumeMax', {
                            val: content.success.data.volume_limit.max,
                            ack: true,
                        });
                    })
                    .catch(error => {
                        this.log.warn(`(device/audio) Unable to execute action: ${error}`);
                    });
            } else if (idNoNamespace === 'meta.bluetooth.active') {
                this.log.debug(`changing bluetooth state to ${state.val}`);

                this.buildRequestAsync('device/bluetooth', 'PUT', { active: state.val })
                    .then(async response => {
                        const content = response.data;

                        await this.setStateChangedAsync('meta.bluetooth.active', {
                            val: content.success.data.active,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.bluetooth.available', {
                            val: content.success.data.available,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.bluetooth.discoverable', {
                            val: content.success.data.discoverable,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.bluetooth.address', {
                            val: content.success.data.mac,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.bluetooth.name', {
                            val: content.success.data.name,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.bluetooth.pairable', {
                            val: content.success.data.pairable,
                            ack: true,
                        });
                    })
                    .catch(error => {
                        this.log.warn(`(device/bluetooth) Unable to execute action: ${error}`);
                    });
            } else if (idNoNamespace === 'meta.bluetooth.name') {
                this.log.debug(`changing bluetooth name to ${state.val}`);

                this.buildRequestAsync('device/bluetooth', 'PUT', { name: state.val })
                    .then(async response => {
                        const content = response.data;

                        await this.setStateChangedAsync('meta.bluetooth.active', {
                            val: content.success.data.active,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.bluetooth.available', {
                            val: content.success.data.available,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.bluetooth.discoverable', {
                            val: content.success.data.discoverable,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.bluetooth.address', {
                            val: content.success.data.mac,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.bluetooth.name', {
                            val: content.success.data.name,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.bluetooth.pairable', {
                            val: content.success.data.pairable,
                            ack: true,
                        });
                    })
                    .catch(error => {
                        this.log.warn(`(device/bluetooth) Unable to execute action: ${error}`);
                    });
            } else if (idNoNamespace === 'apps.next') {
                this.log.debug('switching to next app');

                this.buildRequestAsync('device/apps/next', 'PUT').catch(error => {
                    this.log.warn(`(device/apps/next) Unable to execute action: ${error}`);
                });
            } else if (idNoNamespace === 'apps.prev') {
                this.log.debug('switching to previous app');

                this.buildRequestAsync('device/apps/prev', 'PUT').catch(error => {
                    this.log.warn(`(device/apps/prev) Unable to execute action: ${error}`);
                });
            } else if (idNoNamespace === 'apps.reload') {
                this.log.debug('refreshing app list');
                this.refreshApps();
            } else if (idNoNamespace === 'meta.display.screensaver.enabled') {
                this.log.debug(`changing screensaver state to ${state.val}`);

                this.buildRequestAsync('device/display', 'PUT', { screensaver: { enabled: state.val } })
                    .then(async response => {
                        const content = response.data;

                        await this.setStateChangedAsync('meta.display.screensaver.enabled', {
                            val: content.success.data.screensaver.enabled,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.screensaver.widget', {
                            val: content.success.data.screensaver.widget,
                            ack: true,
                        });

                        const timeBasedObj = content.success.data.screensaver.modes.time_based;

                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.enabled', {
                            val: timeBasedObj.enabled,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.startTime', {
                            val: timeBasedObj.start_time,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.startTimeLocal', {
                            val: timeBasedObj.local_start_time,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.endTime', {
                            val: timeBasedObj.end_time,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.endTimeLocal', {
                            val: timeBasedObj.local_end_time,
                            ack: true,
                        });

                        await this.setStateChangedAsync('meta.display.screensaver.modes.whenDark.enabled', {
                            val: content.success.data.screensaver.modes.when_dark.enabled,
                            ack: true,
                        });
                    })
                    .catch(error => {
                        this.log.warn(`(device/display) Unable to execute action: ${error}`);
                    });
            } else if (idNoNamespace.startsWith('meta.display.screensaver.modes.')) {
                this.log.debug('changing screensaver settings');

                const screensaverStates = await this.getStatesAsync('meta.display.screensaver.*');
                const screensaverEnabledState =
                    screensaverStates?.[`${this.namespace}.meta.display.screensaver.enabled`]?.val;
                const currentModeParams = {};
                let currentMode = 'when_dark';

                if (idNoNamespace.includes('timeBased')) {
                    currentMode = 'time_based';
                    currentModeParams.enabled =
                        screensaverStates?.[`${this.namespace}.meta.display.screensaver.modes.timeBased.enabled`]
                            ?.val ?? false;
                    currentModeParams.start_time =
                        screensaverStates?.[`${this.namespace}.meta.display.screensaver.modes.timeBased.startTime`]
                            ?.val ?? '23:00:00';
                    currentModeParams.end_time =
                        screensaverStates?.[`${this.namespace}.meta.display.screensaver.modes.timeBased.endTime`]
                            ?.val ?? '08:00:00';
                } else if (idNoNamespace.includes('whenDark')) {
                    currentMode = 'when_dark';
                    currentModeParams.enabled =
                        screensaverStates?.[`${this.namespace}.meta.display.screensaver.modes.whenDark.enabled`]?.val ??
                        false;
                }

                this.buildRequestAsync('device/display', 'PUT', {
                    screensaver: {
                        enabled: screensaverEnabledState ?? false,
                        mode: currentMode,
                        mode_params: currentModeParams,
                    },
                })
                    .then(async response => {
                        const content = response.data;

                        await this.setStateChangedAsync('meta.display.screensaver.enabled', {
                            val: content.success.data.screensaver.enabled,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.screensaver.widget', {
                            val: content.success.data.screensaver.widget,
                            ack: true,
                        });

                        const timeBasedObj = content.success.data.screensaver.modes.time_based;

                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.enabled', {
                            val: timeBasedObj.enabled,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.startTime', {
                            val: timeBasedObj.start_time,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.startTimeLocal', {
                            val: timeBasedObj.local_start_time,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.endTime', {
                            val: timeBasedObj.end_time,
                            ack: true,
                        });
                        await this.setStateChangedAsync('meta.display.screensaver.modes.timeBased.endTimeLocal', {
                            val: timeBasedObj.local_end_time,
                            ack: true,
                        });

                        await this.setStateChangedAsync('meta.display.screensaver.modes.whenDark.enabled', {
                            val: content.success.data.screensaver.modes.when_dark.enabled,
                            ack: true,
                        });
                    })
                    .catch(error => {
                        this.log.warn(`(device) Unable to execute action: ${error}`);
                    });
            } else if (idNoNamespace.startsWith('apps.')) {
                const matches = id.match(/.+\.apps\.([a-z0-9_]{0,32})\.(.*)$/);
                const widget = matches ? matches[1] : undefined;
                const action = matches ? matches[2] : undefined;

                this.log.debug(`[widget] running action "${action}" on "${widget}"`);

                const packState = await this.getStateAsync(`apps.${widget}.package`);
                if (action && packState) {
                    const pack = packState.val;

                    if (action === 'activate') {
                        this.log.debug(`[widget] activating "${widget}" of package "${pack}"`);

                        this.buildRequestAsync(`device/apps/${pack}/widgets/${widget}/activate`, 'PUT').catch(error => {
                            this.log.warn(
                                `(device/apps/${pack}/widgets/${widget}/activate) Unable to execute action: ${error}`,
                            );
                        });
                    } else {
                        this.log.debug(
                            `[widget] running special action "${action}" on "${widget}" of package "${pack}"`,
                        );

                        const data = { id: action };

                        // START special Widgets

                        if (action == 'clock.clockface') {
                            if (['weather', 'page_a_day', 'custom', 'none'].includes(String(state.val))) {
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

                            await this.setState(idNoNamespace, { val: state.val, ack: true }); // Confirm state change
                        } else if (action.startsWith('clock.alarm')) {
                            const caStates = await this.getStatesAsync(`apps.${widget}.clock.alarm.*`);

                            this.log.debug(`[widget] current clock.alarm states: ${JSON.stringify(caStates)}`);

                            const caEnabled =
                                action === 'clock.alarm.enabled'
                                    ? state.val
                                    : caStates[`${this.namespace}.apps.${widget}.clock.alarm.enabled`]?.val;
                            const caTime =
                                action === 'clock.alarm.time'
                                    ? state.val
                                    : caStates[`${this.namespace}.apps.${widget}.clock.alarm.time`]?.val;
                            const caWithRadio =
                                action === 'clock.alarm.wake_with_radio'
                                    ? state.val
                                    : caStates[`${this.namespace}.apps.${widget}.clock.alarm.wake_with_radio`]?.val;

                            data.id = 'clock.alarm';
                            data.params = {
                                enabled: caEnabled ?? false,
                                time: caTime ?? '10:00:00',
                                wake_with_radio: caWithRadio ?? false,
                            };

                            await this.setStateChangedAsync(`apps.${widget}.clock.alarm.enabled`, {
                                val: data.params.enabled,
                                ack: true,
                            });
                            await this.setStateChangedAsync(`apps.${widget}.clock.alarm.time`, {
                                val: data.params.time,
                                ack: true,
                            });
                            await this.setStateChangedAsync(`apps.${widget}.clock.alarm.wake_with_radio`, {
                                val: data.params.wake_with_radio,
                                ack: true,
                            });
                        } else if (action == 'countdown.configure') {
                            data.params = {
                                duration: state.val,
                                start_now: false,
                            };

                            await this.setState(idNoNamespace, { val: state.val, ack: true }); // Confirm state change
                        }

                        // END special Widgets

                        this.buildRequestAsync(`device/apps/${pack}/widgets/${widget}/actions`, 'POST', data).catch(
                            error => {
                                this.log.warn(
                                    `(device/apps/${pack}/widgets/${widget}/actions) Unable to execute action: ${error}`,
                                );
                            },
                        );
                    }
                }
            }
        }
    }

    /**
     * @param {string} id
     * @param {ioBroker.Object | null | undefined} obj
     */
    onObjectChange(id, obj) {
        if (id && this.myDataDiyForeignStates.filter(item => item.id === id).length > 0) {
            const isNumberState = this.myDataDiyNumberStates.includes(id);

            if (obj) {
                if (obj.common?.type == 'number') {
                    // Add if not in the list
                    if (!isNumberState) {
                        this.myDataDiyNumberStates.push(id);

                        this.log.debug(
                            `[mydatadiy] onObjectChange - added state "${id}" to number states list: ${JSON.stringify(this.myDataDiyNumberStates)}`,
                        );
                    }
                } else if (isNumberState) {
                    this.myDataDiyNumberStates.splice(this.myDataDiyNumberStates.indexOf(id), 1);

                    this.log.debug(
                        `[mydatadiy] onObjectChange - removed state "${id}" from number states list: ${JSON.stringify(this.myDataDiyNumberStates)}`,
                    );
                }
            } else {
                // Object deleted
                if (isNumberState) {
                    this.myDataDiyNumberStates.splice(this.myDataDiyNumberStates.indexOf(id), 1);

                    this.log.debug(
                        `[mydatadiy] onObjectChange - removed deleted state "${id}" from number states list: ${JSON.stringify(this.myDataDiyNumberStates)}`,
                    );
                }
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
            // Notification
            if (obj.command === 'notification' && typeof obj.message === 'object') {
                const data = {};
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
                        const numberItems = notification.text[i].filter(item => typeof item === 'number');

                        if (numberItems.length > 0) {
                            // @ts-expect-error Assign to never
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

                        // @ts-expect-error Assign to never
                        dataModel.frames.push(frame);
                    }
                }

                if (notification.sound) {
                    dataModel.sound = {
                        category: notification.sound.includes('alarm') ? 'alarms' : 'notifications',
                        id: notification.sound,
                        repeat: 1,
                    };
                } else if (notification.soundUrl) {
                    dataModel.sound = {
                        url: notification.soundUrl,
                        type: 'mp3',
                        fallback: {
                            // Default fallback - not configurable
                            category: 'notifications',
                            id: 'bicycle',
                        },
                    };
                }

                if (notification.cycles) {
                    dataModel.cycles = notification.cycles; // Optional
                }

                data.model = dataModel;

                this.log.debug(`[onMessage] Notification data: ${JSON.stringify(data)}`);

                this.buildRequestAsync('device/notifications', 'POST', data)
                    .then(async response => {
                        const content = response.data;

                        // Confirm message
                        if (obj.callback) {
                            if (content && content.success) {
                                this.sendTo(obj.from, obj.command, content.success, obj.callback);
                            } else {
                                this.sendTo(obj.from, obj.command, { error: 'failed' }, obj.callback);
                            }
                        }
                    })
                    .catch(error => {
                        this.log.warn(`(device/notifications) Unable to execute action: ${error}`);

                        if (obj.callback) {
                            this.sendTo(obj.from, obj.command, { error: error }, obj.callback);
                        }
                    });
            } else if (obj.command === 'getPollingUrl' && typeof obj.message === 'object') {
                if (obj.message?.webInstance) {
                    this.log.debug(
                        `[onMessage] Try to get instance configuration of system.adapter.${obj.message.webInstance}`,
                    );

                    this.getForeignObjectAsync(`system.adapter.${obj.message.webInstance}`)
                        .then(webObj => {
                            const protocol = webObj?.native?.secure ? 'https' : 'http';
                            const bind = webObj?.native?.bind;
                            const port = webObj?.native?.port;

                            this.sendTo(
                                obj.from,
                                obj.command,
                                `${protocol}://${bind}:${port}/${this.namespace}/`,
                                obj.callback,
                            );
                        })
                        .catch(err => {
                            this.sendTo(obj.from, obj.command, `Error: ${err}`, obj.callback);
                        });
                } else {
                    this.sendTo(obj.from, obj.command, 'Please select a web instance for url preview', obj.callback);
                }
            } else if (obj.command === 'sendNotification' && typeof obj.message === 'object') {
                const notification = obj.message;

                const { instances } = notification.category;

                const messages = Object.entries(instances)
                    .map(([, entry]) => entry.messages.map(m => m.message))
                    .join(', ');

                // TODO: Configurable options for notifications
                const data = {
                    model: {
                        iconType: 'alert',
                        priority: 'critical',
                        sound: {
                            category: 'alarms',
                            id: 'alarm1',
                            repeat: 1,
                        },
                        frames: [
                            {
                                icon: 'i3389',
                                text: messages,
                            },
                        ],
                    },
                };

                this.buildRequestAsync('device/notifications', 'POST', data)
                    .then(async response => {
                        const content = response.data;

                        // Confirm message
                        if (obj.callback) {
                            if (content && content.success) {
                                this.sendTo(obj.from, obj.command, content.success, obj.callback);
                            } else {
                                this.sendTo(obj.from, obj.command, { error: 'failed' }, obj.callback);
                            }
                        }
                    })
                    .catch(error => {
                        this.log.warn(`(device/notifications) Unable to execute action: ${error}`);

                        if (obj.callback) {
                            this.sendTo(obj.from, obj.command, { error: error }, obj.callback);
                        }
                    });
            } else {
                this.log.error(`[onMessage] Received incomplete message via "sendTo"`);

                if (obj.callback) {
                    this.sendTo(obj.from, obj.command, { error: 'Incomplete message' }, obj.callback);
                }
            }
        } else if (obj.callback) {
            this.sendTo(obj.from, obj.command, { error: 'Invalid message' }, obj.callback);
        }
    }

    async setApiConnected(connection) {
        if (connection !== this.apiConnected) {
            await this.setStateChangedAsync('info.connection', { val: connection, ack: true });
            this.apiConnected = connection;

            if (connection) {
                // API was offline - refresh all states
                this.log.debug('API is online');

                await this.refreshApps();
            } else {
                this.log.debug('API is offline');
            }
        }
    }

    async refreshState() {
        return new Promise(resolve => {
            this.log.debug('re-creating refresh state timeout');
            this.refreshStateTimeout =
                this.refreshStateTimeout ||
                this.setTimeout(() => {
                    try {
                        this.refreshStateTimeout = null;
                        this.refreshState();
                    } catch (error) {
                        this.log.warn(`(device) Unable to refresh state: ${error}`);
                    }
                }, 60000);

            this.buildRequestAsync()
                .then(async response => {
                    const content = response.data;

                    await this.setApiConnected(true);

                    this.log.debug(`(api) API-Version: ${content.api_version}`);

                    await this.setStateChangedAsync('meta.versionApi', {
                        val: content.api_version,
                        ack: true,
                        c: `Recommended: >=${this.supportedApiVersion}`,
                    });

                    if (
                        this.isNewerVersion(content.api_version, this.supportedApiVersion) &&
                        !this.displayedVersionWarning
                    ) {
                        this.log.warn(
                            `Update your LaMetric device - supported API version of this adapter is ${this.supportedApiVersion} (or later). Your current version is ${content.api_version}`,
                        );
                    }

                    if (content.endpoints?.stream_url) {
                        this.log.debug(`(api) This device supports streaming: ${content.endpoints.stream_url}`);
                        this.supportsStreaming = true;

                        this.setStateChangedAsync('streaming.supported', {
                            val: true,
                            ack: true,
                            c: content.api_version,
                        });

                        this.buildRequestAsync('device/stream', 'GET')
                            .then(async () => {
                                // const content = response.data;
                                // TODO
                            })
                            .catch(error => {
                                this.log.warn(`(device/stream) Unable to get information: ${error}`);
                            });
                    } else {
                        this.setStateChangedAsync('streaming.supported', {
                            val: false,
                            ack: true,
                            c: content.api_version,
                        });
                    }

                    this.buildRequestAsync('device', 'GET')
                        .then(async response => {
                            const content = response.data;

                            this.log.debug(`(device) Model: ${content.model} (${content.os_version})`);

                            const supportedVersion = this.supportedVersions[content.model];
                            if (!supportedVersion) {
                                throw new Error(`Device model "${content.model}" is not supported by this adapter`);
                            }

                            if (
                                this.isNewerVersion(content.os_version, supportedVersion) &&
                                !this.displayedVersionWarning
                            ) {
                                this.log.warn(
                                    `Update your LaMetric device - supported version of this adapter is ${supportedVersion} (or later). Your current version is ${content.os_version}`,
                                );
                                this.displayedVersionWarning = true; // Just show once
                            }

                            await this.setStateChangedAsync('meta.name', { val: content.name, ack: true });
                            await this.setStateChangedAsync('meta.serial', { val: content.serial_number, ack: true });
                            await this.setStateChangedAsync('meta.version', {
                                val: content.os_version,
                                ack: true,
                                c: `Recommended: >=${supportedVersion}`,
                            });
                            await this.setStateChangedAsync('meta.versionUpdate', {
                                val: content?.update_available?.version ?? '-',
                                ack: true,
                            });
                            await this.setStateChangedAsync('meta.model', { val: content.model, ack: true });
                            await this.setStateChangedAsync('meta.mode', { val: content.mode, ack: true });

                            await this.setStateChangedAsync('meta.audio.volume', {
                                val: content.audio.volume,
                                ack: true,
                            });
                            await this.setStateChangedAsync('meta.audio.volumeMin', {
                                val: content.audio.volume_limit.min,
                                ack: true,
                            });
                            await this.setStateChangedAsync('meta.audio.volumeMax', {
                                val: content.audio.volume_limit.max,
                                ack: true,
                            });

                            await this.setStateChangedAsync('meta.bluetooth.available', {
                                val: content.bluetooth.available,
                                ack: true,
                            });
                            await this.setStateChangedAsync('meta.bluetooth.name', {
                                val: content.bluetooth.name,
                                ack: true,
                            });
                            await this.setStateChangedAsync('meta.bluetooth.active', {
                                val: content.bluetooth.active,
                                ack: true,
                            });
                            await this.setStateChangedAsync('meta.bluetooth.discoverable', {
                                val: content.bluetooth.discoverable,
                                ack: true,
                            });
                            await this.setStateChangedAsync('meta.bluetooth.pairable', {
                                val: content.bluetooth.pairable,
                                ack: true,
                            });
                            await this.setStateChangedAsync('meta.bluetooth.address', {
                                val: content.bluetooth.address,
                                ack: true,
                            });

                            if (content.bluetooth?.low_energy) {
                                await this.setStateChangedAsync('meta.bluetooth.low_energy.active', {
                                    val: content.bluetooth.low_energy.active,
                                    ack: true,
                                });
                                await this.setStateChangedAsync('meta.bluetooth.low_energy.advertising', {
                                    val: content.bluetooth.low_energy.advertising,
                                    ack: true,
                                });
                                await this.setStateChangedAsync('meta.bluetooth.low_energy.connectable', {
                                    val: content.bluetooth.low_energy.connectable,
                                    ack: true,
                                });
                            } else {
                                await this.setStateChangedAsync('meta.bluetooth.low_energy.active', {
                                    val: false,
                                    ack: true,
                                    c: 'Not available',
                                });
                                await this.setStateChangedAsync('meta.bluetooth.low_energy.advertising', {
                                    val: false,
                                    ack: true,
                                    c: 'Not available',
                                });
                                await this.setStateChangedAsync('meta.bluetooth.low_energy.connectable', {
                                    val: false,
                                    ack: true,
                                    c: 'Not available',
                                });
                            }

                            await this.setStateChangedAsync('meta.wifi.active', {
                                val: content.wifi.active,
                                ack: true,
                            });
                            await this.setStateChangedAsync('meta.wifi.address', {
                                val: content.wifi.address,
                                ack: true,
                            });
                            await this.setStateChangedAsync('meta.wifi.available', {
                                val: content.wifi.available,
                                ack: true,
                            });
                            await this.setStateChangedAsync('meta.wifi.encryption', {
                                val: content.wifi.encryption,
                                ack: true,
                            });
                            await this.setStateChangedAsync('meta.wifi.ssid', { val: content.wifi.essid, ack: true });
                            await this.setStateChangedAsync('meta.wifi.ip', { val: content.wifi.ip, ack: true });
                            await this.setStateChangedAsync('meta.wifi.mode', { val: content.wifi.mode, ack: true });
                            await this.setStateChangedAsync('meta.wifi.netmask', {
                                val: content.wifi.netmask,
                                ack: true,
                            });
                            await this.setStateChangedAsync('meta.wifi.strength', {
                                val: content.wifi.strength,
                                ack: true,
                            });

                            this.buildRequestAsync('device/display', 'GET')
                                .then(async response => {
                                    const content = response.data;

                                    await this.setStateChangedAsync('meta.display.brightness', {
                                        val: content.brightness,
                                        ack: true,
                                    });
                                    await this.setStateChangedAsync('meta.display.brightnessMin', {
                                        val: content.brightness_limit.min,
                                        ack: true,
                                    });
                                    await this.setStateChangedAsync('meta.display.brightnessMax', {
                                        val: content.brightness_limit.max,
                                        ack: true,
                                    });
                                    await this.setStateChangedAsync('meta.display.brightnessAuto', {
                                        val: content.brightness_mode === 'auto',
                                        ack: true,
                                    });
                                    await this.setStateChangedAsync('meta.display.brightnessMode', {
                                        val: content.brightness_mode,
                                        ack: true,
                                    });

                                    await this.setStateChangedAsync('meta.display.width', {
                                        val: content.width,
                                        ack: true,
                                    });
                                    await this.setStateChangedAsync('meta.display.height', {
                                        val: content.height,
                                        ack: true,
                                    });
                                    await this.setStateChangedAsync('meta.display.type', {
                                        val: content.type,
                                        ack: true,
                                    });

                                    await this.setStateChangedAsync('meta.display.screensaver.enabled', {
                                        val: content.screensaver.enabled,
                                        ack: true,
                                    });
                                    await this.setStateChangedAsync('meta.display.screensaver.widget', {
                                        val: content.screensaver.widget,
                                        ack: true,
                                    });

                                    const timeBasedScreensaver = content.screensaver.modes.time_based;

                                    await this.setStateChangedAsync(
                                        'meta.display.screensaver.modes.timeBased.enabled',
                                        { val: timeBasedScreensaver?.enabled, ack: true },
                                    );
                                    await this.setStateChangedAsync(
                                        'meta.display.screensaver.modes.timeBased.startTime',
                                        { val: timeBasedScreensaver?.start_time, ack: true },
                                    );
                                    await this.setStateChangedAsync(
                                        'meta.display.screensaver.modes.timeBased.startTimeLocal',
                                        { val: timeBasedScreensaver?.local_start_time, ack: true },
                                    );
                                    await this.setStateChangedAsync(
                                        'meta.display.screensaver.modes.timeBased.endTime',
                                        { val: timeBasedScreensaver?.end_time, ack: true },
                                    );
                                    await this.setStateChangedAsync(
                                        'meta.display.screensaver.modes.timeBased.endTimeLocal',
                                        { val: timeBasedScreensaver?.local_end_time, ack: true },
                                    );

                                    await this.setStateChangedAsync('meta.display.screensaver.modes.whenDark.enabled', {
                                        val: content.screensaver.modes.when_dark.enabled,
                                        ack: true,
                                    });

                                    resolve(true);
                                })
                                .catch(error => {
                                    this.log.warn(`(device/display) Unable to get status: ${error}`);
                                    resolve(false);
                                });
                        })
                        .catch(error => {
                            this.log.warn(`(device) Unable to get status: ${error}`);

                            resolve(false);
                        });
                })
                .catch(error => {
                    this.log.warn(`(api) Device not reachable: ${error}`);

                    this.setApiConnected(false);
                    resolve(false);
                });
        });
    }

    async refreshApps() {
        return new Promise(resolve => {
            if (this.apiConnected) {
                this.log.debug('[apps] re-creating refresh timeout');
                this.refreshAppTimeout =
                    this.refreshAppTimeout ||
                    this.setTimeout(
                        () => {
                            this.refreshAppTimeout = null;
                            this.refreshApps();
                        },
                        60 * 60 * 1000,
                    );

                this.buildRequestAsync('device/apps', 'GET')
                    .then(async response => {
                        const content = response.data;

                        const appPath = 'apps';

                        const channelObjs = await this.getChannelsOfAsync(appPath);
                        const appsAll = [];
                        const appsKeep = [];

                        // Collect all apps
                        if (channelObjs) {
                            for (let i = 0; i < channelObjs.length; i++) {
                                const id = this.removeNamespace(channelObjs[i]._id);

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
                                const widgetPath = uuid.replace('.', '_');

                                appsKeep.push(`${appPath}.${widgetPath}`);
                                this.log.debug(`[apps] found (keep): ${appPath}.${widgetPath}`);

                                if (this.config.type === 'push') {
                                    // Save UUID for push url
                                    if (pack.package === MY_DATA_DIY_PACKAGE) {
                                        this.log.debug(`[mydatadiy] found app widget with uuid "${uuid}"`);
                                        this.myDataDiyApp = uuid;

                                        if (this.isNewerVersion(pack.version, '2.0.0')) {
                                            this.log.warn(
                                                `[mydatadiy] Please update the "My Data DIY" app to a version >= 2.0.0 to use push (or configure polling)`,
                                            );
                                        }
                                    }
                                }

                                await this.extendObjectAsync(`${appPath}.${widgetPath}`, {
                                    type: 'channel',
                                    common: {
                                        name: `Widget ${pack.package} (${pack.version})`,
                                    },
                                    native: {},
                                });

                                await this.extendObjectAsync(`${appPath}.${widgetPath}.activate`, {
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

                                await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.index`, {
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
                                await this.setStateChangedAsync(`${appPath}.${widgetPath}.index`, {
                                    val: widget.index,
                                    ack: true,
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.package`, {
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
                                await this.setStateChangedAsync(`${appPath}.${widgetPath}.package`, {
                                    val: pack.package,
                                    ack: true,
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.vendor`, {
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
                                await this.setStateChangedAsync(`${appPath}.${widgetPath}.vendor`, {
                                    val: pack.vendor,
                                    ack: true,
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.version`, {
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
                                await this.setStateChangedAsync(`${appPath}.${widgetPath}.version`, {
                                    val: pack.version,
                                    ack: true,
                                });

                                await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.visible`, {
                                    type: 'state',
                                    common: {
                                        name: {
                                            en: 'Visible',
                                            de: 'Sichtbar',
                                            ru: 'Видимый',
                                            pt: 'Visível',
                                            nl: 'Vertaling:',
                                            fr: 'Visible',
                                            it: 'Visibile',
                                            es: 'Visible',
                                            pl: 'Widoczny',
                                            uk: 'Вибрані',
                                            'zh-cn': '不可抗辩',
                                        },
                                        type: 'boolean',
                                        role: 'indicator',
                                        read: true,
                                        write: false,
                                    },
                                    native: {},
                                });
                                await this.setStateChangedAsync(`${appPath}.${widgetPath}.visible`, {
                                    val: widget.visible,
                                    ack: true,
                                });

                                // START special Widgets

                                if (pack.package === 'com.lametric.clock') {
                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.clock`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.clock.clockface`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.clock.alarm`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.clock.alarm.enabled`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.clock.alarm.time`, {
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

                                    await this.setObjectNotExistsAsync(
                                        `${appPath}.${widgetPath}.clock.alarm.wake_with_radio`,
                                        {
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
                                        },
                                    );
                                } else if (pack.package === 'com.lametric.radio') {
                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.radio`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.radio.play`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.radio.stop`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.radio.next`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.radio.prev`, {
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
                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.stopwatch`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.stopwatch.start`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.stopwatch.pause`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.stopwatch.reset`, {
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
                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.weather`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.weather.forecast`, {
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
                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.countdown`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.countdown.configure`, {
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
                                            unit: 'sec',
                                        },
                                        native: {},
                                    });

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.countdown.start`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.countdown.pause`, {
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

                                    await this.setObjectNotExistsAsync(`${appPath}.${widgetPath}.countdown.reset`, {
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
                        for (const app of appsAll) {
                            if (!appsKeep.includes(app)) {
                                await this.delObjectAsync(app, { recursive: true });
                                this.log.debug(`[apps] deleted: ${app}`);
                            }
                        }

                        resolve(true);
                    })
                    .catch(error => {
                        this.log.warn(`(device/apps) Unable to execute action: ${error}`);
                        resolve(false);
                    });
            }
        });
    }

    buildRequestAsync(service, method, data) {
        return new Promise((resolve, reject) => {
            const baseURL = `${this.prefix}://${this.config.lametricIp}:${this.port}`;
            const url = service ? `/api/v2/${service}` : '/api/v2';

            if (!method) {
                method = 'GET';
            }

            if (this.config.lametricIp && this.config.lametricToken) {
                if (data) {
                    this.log.debug(
                        `sending "${method}" request to "${url}" with ${this.prefix} on port ${this.port} with data: ${JSON.stringify(data)}`,
                    );
                } else {
                    this.log.debug(
                        `sending "${method}" request to "${url}" with ${this.prefix} on port ${this.port} without data`,
                    );
                }

                axios({
                    method,
                    data,
                    baseURL,
                    url,
                    timeout: 3000,
                    responseType: 'json',
                    auth: {
                        username: 'dev',
                        password: this.config.lametricToken,
                    },
                    validateStatus: function (status) {
                        return [200, 201].includes(status);
                    },
                    httpsAgent: new https.Agent({
                        rejectUnauthorized: false,
                    }),
                })
                    .then(response => {
                        this.log.debug(
                            `received ${response.status} response from "${baseURL}${url}" with content: ${JSON.stringify(response.data)}`,
                        );

                        // no error - clear up reminder
                        delete this.lastErrorCode;

                        resolve(response);
                    })
                    .catch(error => {
                        if (error.response) {
                            // The request was made and the server responded with a status code

                            this.log.warn(
                                `received ${error.response.status} response from ${baseURL}${url} with content: ${JSON.stringify(error.response.data)}`,
                            );
                        } else if (error.request) {
                            // The request was made but no response was received
                            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                            // http.ClientRequest in node.js

                            // avoid spamming of the same error when stuck in a reconnection loop
                            if (error.code === this.lastErrorCode) {
                                this.log.debug(error.message);
                            } else {
                                this.log.info(`error ${error.code} from ${baseURL}${url}: ${error.message}`);
                                this.lastErrorCode = error.code;
                            }
                        } else {
                            // Something happened in setting up the request that triggered an Error
                            this.log.error(error.message);
                        }

                        reject(error);
                    });
            } else {
                reject('Device IP and/or token is not configured');
            }
        });
    }

    collectMyDataDiyForeignStates(frames) {
        this.log.debug('[mydatadiy] collecting states');

        const foreignStates = [];

        // Collect all IDs in texts
        frames.forEach(f => {
            f.text.replace(this.myDataDiyRegex, (m, id) => {
                if (!foreignStates.includes(id)) {
                    this.log.debug(`[mydatadiy] found dynamic state with id "${id}" in text`);
                    foreignStates.push(id);
                }
            });

            f.icon.replace(this.myDataDiyRegex, (m, id) => {
                if (!foreignStates.includes(id)) {
                    this.log.debug(`[mydatadiy] found dynamic state with id "${id}" in icon`);
                    foreignStates.push(id);
                }
            });
        });

        this.log.debug(`[mydatadiy] found ${foreignStates.length} dynamic states: ${JSON.stringify(foreignStates)}`);

        Promise.all(
            foreignStates.map(id => {
                return new Promise(resolve => {
                    this.getForeignObjectAsync(id)
                        .then(object => {
                            this.subscribeForeignStatesAsync(id);
                            this.subscribeForeignObjectsAsync(id);
                            this.log.debug(`[mydatadiy] subscribed to foreign state "${id}"`);

                            if (object && object.type == 'state') {
                                if (object.common?.type == 'number') {
                                    this.myDataDiyNumberStates.push(id);
                                }

                                return this.getForeignStateAsync(id);
                            }
                            throw new Error(`Invalid object (type ${object?.type || 'unknown'})`);
                        })
                        .then(state => {
                            if (state) {
                                this.log.debug(
                                    `[mydatadiy] received value "${state.val}" of state "${id}" (ack: ${state.ack})`,
                                );

                                resolve({
                                    id: id,
                                    val: this.formatMyDataDiyValue(id, state.val),
                                });
                            } else {
                                throw new Error('Invalid state (maybe empty or null)');
                            }
                        })
                        .catch(err => {
                            this.log.warn(`[mydatadiy] unable to get value of "${id}": ${err}`);
                            resolve({
                                id: id,
                                val: `<error ${id}: ${err}>`,
                            });
                        });
                });
            }),
        ).then(data => {
            this.myDataDiyForeignStates = data;

            this.log.debug(`[mydatadiy] found foreign states: ${JSON.stringify(this.myDataDiyForeignStates)}`);
            this.refreshMyDataDiy();
        });
    }

    async refreshMyDataDiy() {
        this.log.debug(`[mydatadiy] refresh output state with config: ${JSON.stringify(this.config.mydatadiy)}`);

        const clonedFrames = JSON.parse(JSON.stringify(this.config.mydatadiy)); // TODO: Better way to clone?! structuredClone in nodejs 17
        const newFrames = clonedFrames
            .map(f => {
                let replacedText = f.text.replace(this.myDataDiyRegex, (m, id) => {
                    const foreignState = this.myDataDiyForeignStates.find(item => item.id === id);
                    if (foreignState) {
                        const newVal = foreignState.val;

                        this.log.debug(`[mydatadiy] replacing "${id}" in frame text with "${newVal}"`);

                        return newVal;
                    }
                    return `<error ${id}: not found>`;
                });

                if (f?.hideif && f.hideif == replacedText) {
                    this.log.debug(`[mydatadiy] removing frame because text matches configured hideif: "${f.hideif}"`);
                    replacedText = ''; // will be removed in filter function (see below)
                }

                let duration = f?.duration ?? 5;

                if (duration > 10) {
                    duration = 10; // 10 seconds is the limit
                }

                const newObj = {
                    text: replacedText.trim(),
                    duration: duration * 1000, // ms
                };

                if (f.icon) {
                    newObj.icon = f.icon.replace(this.myDataDiyRegex, (m, id) => {
                        const newVal = this.myDataDiyForeignStates.find(item => item.id === id).val;

                        this.log.debug(`[mydatadiy] replacing "${id}" in frame text with "${newVal}"`);

                        return newVal;
                    });
                }

                return newObj;
            })
            .filter(f => {
                if (f.text.length == 0) {
                    this.log.debug(`[mydatadiy] removed frame with empty text`);
                }
                return f.text.length > 0;
            });

        this.log.debug(`[mydatadiy] completed - frame update to ${JSON.stringify(newFrames)}`);

        await this.setState('mydatadiy.obj', { val: JSON.stringify({ frames: newFrames }), ack: true });

        if (this.config.type === 'push') {
            if (!this.myDataDiyApp) {
                this.log.warn(
                    `[mydatadiy] unable to push changes to device - app package id not found (app installed?)`,
                );
            } else if (newFrames.length > 0) {
                this.log.debug(`[mydatadiy] pusing changes to device - app ${this.myDataDiyApp}`);

                this.buildRequestAsync(`widget/update/${MY_DATA_DIY_PACKAGE}/${this.myDataDiyApp}`, 'POST', {
                    frames: newFrames,
                }).catch(error => {
                    this.log.warn(
                        `(widget/update/${MY_DATA_DIY_PACKAGE}/${this.myDataDiyApp}) Unable to execute action: ${error}`,
                    );
                });
            } else {
                this.log.debug(`[mydatadiy] skipping -> no frames configured - app ${this.myDataDiyApp}`);
            }
        }
    }

    formatMyDataDiyValue(id, val) {
        let newVal = val;

        if (this.myDataDiyNumberStates.includes(id)) {
            if (!isNaN(val) && val % 1 !== 0) {
                let countDecimals = String(val).split('.')[1].length || 2;

                if (countDecimals > 3) {
                    countDecimals = 3; // limit
                }

                newVal = this.formatValue(val, countDecimals);
                this.log.debug(
                    `[mydatadiy] formatted value of "${id}" from ${val} to ${newVal} (${countDecimals} decimals)`,
                );
            }
        }

        return newVal;
    }

    removeNamespace(id) {
        const re = new RegExp(`${this.namespace}*\\.`, 'g');
        return id.replace(re, '');
    }

    /**
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            if (this.apiConnected && this.config.type === 'push' && this.myDataDiyApp) {
                this.buildRequestAsync(`widget/update/${MY_DATA_DIY_PACKAGE}/${this.myDataDiyApp}`, 'POST', {
                    frames: [{ text: 'Adapter stopped', icon: 'a9335' }],
                }).catch(error => {
                    this.log.warn(
                        `(widget/update/${MY_DATA_DIY_PACKAGE}/${this.myDataDiyApp}) Unable to execute action: ${error}`,
                    );
                });
            }

            this.setApiConnected(false);
            this.setState('mydatadiy.obj', {
                val: JSON.stringify({ frames: [{ text: 'Adapter stopped', icon: 'a9335' }] }),
                ack: true,
            });

            if (this.refreshStateTimeout) {
                this.log.debug('clearing refresh state timeout');
                this.clearTimeout(this.refreshStateTimeout);
            }

            if (this.refreshAppTimeout) {
                this.log.debug('clearing refresh app timeout');
                this.clearTimeout(this.refreshAppTimeout);
            }

            callback();
        } catch {
            callback();
        }
    }

    isNewerVersion(oldVer, newVer) {
        const oldParts = oldVer.split('.');
        const newParts = newVer.split('.');
        for (let i = 0; i < newParts.length; i++) {
            const a = ~~newParts[i]; // parse int
            const b = ~~oldParts[i]; // parse int
            if (a > b) {
                return true;
            }
            if (a < b) {
                return false;
            }
        }
        return false;
    }
}

if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options]
     */
    module.exports = options => new LaMetric(options);
} else {
    // otherwise start the instance directly
    new LaMetric();
}
