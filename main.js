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
    }

    onStateChange(id, state) {
        if (id && state && !state.ack) {
            // No ack = changed by user
            if (id === this.namespace + '.meta.display.brightness') {
                this.log.info('changing brightness to ' + state.val);

                this.buildRequest(
                    'device/display',
                    content => {
                        this.refreshState();
                    },
                    'PUT',
                    {
                        brightness: state.val,
                        brightness_mode: 'manual'
                    }
                );
            } else if (id === this.namespace + '.meta.display.brightnessAuto') {
                this.buildRequest(
                    'device/display',
                    content => {
                        this.refreshState();
                    },
                    'PUT',
                    {
                        brightness_mode: state ? 'auto' : 'manual'
                    }
                );
            } else if (id === this.namespace + '.meta.audio.volume') {
                this.log.info('changing volume to ' + state.val);

                this.buildRequest(
                    'device/audio',
                    content => {
                        this.refreshState();
                    },
                    'PUT',
                    {
                        volume: state.val
                    }
                );
            }
        }
    }

    onMessage(obj) {
        this.log.info('received message');

        if (obj && obj.message && obj.command === 'send') {

            this.log.info('message ' + JSON.stringify(obj.message));

            if (lastMessageId !== null) {
                this.buildRequest(
                    'device/notifications/' + lastMessageId,
                    () => {
                        setTimeout(
                            () => this.buildRequest(
                                'device/notifications',
                                content => {
                                    this.log.debug('Response: ' + JSON.stringify(content));
                                    if (content && content.success) {
                                        lastMessageId = content.success.id;
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
                                obj.message
                            ),
                            500
                        );
                    },
                    'DELETE'
                );
            } else {
                this.buildRequest(
                    'device/notifications',
                    content => {
                        this.log.debug('Response: ' + JSON.stringify(content));
                        if (content && content.success) {
                            lastMessageId = content.success.id;
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
                    obj.message
                );
            }
        }
    }

    refreshState() {
        this.log.debug('refreshing LaMetric state');

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
    
                this.setState('meta.display.brightness', {val: content.display.brightness, ack: true});
                this.setState('meta.display.brightnessAuto', {val: content.display.brightness_mode == 'auto', ack: true});
                this.setState('meta.display.brightnessMode', {val: content.display.brightness_mode, ack: true});
                this.setState('meta.display.width', {val: content.display.width, ack: true});
                this.setState('meta.display.height', {val: content.display.height, ack: true});
                this.setState('meta.display.type', {val: content.display.type, ack: true});
    
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
    }

    buildRequest(service, callback, method, data) {
        const url = 'http://' + this.config.lametricIp + ':8080/api/v2/' + service;

        this.log.info('sending "' + method + '" request to "' + url + '" with data: ' + JSON.stringify(data));

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
                    callback();
                } else {
                    this.log.error('Status Code: ' + response.statusCode + ' / Content: ' + JSON.stringify(content));
                    callback();
                }
            }
        );
    }

    onUnload(callback) {
        try {
            this.setState('info.connection', false, true);
            this.log.info('cleaned everything up...');
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