/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

const utils = require(__dirname + '/lib/utils');
const request = require('request');

const adapter = new utils.Adapter('lametric');

let lastMessageId = null;

adapter.on('unload', callback => {
    try {
        adapter.setState('info.connection', false, true);
        callback();
    } catch (e) {
        callback();
    }
});

adapter.on('message', obj => {
    adapter.log.info('received message');

    if (obj && obj.message && obj.command === 'send') {

        adapter.log.info('message ' + JSON.stringify(obj.message));

        if (lastMessageId !== null) {
            buildRequest('device/notifications/' + lastMessageId, () => {
                setTimeout(() =>
                    buildRequest(
                        'device/notifications',
                        content => {
                            adapter.log.debug('Response: ' + JSON.stringify(content));
                            if (content && content.success) {
                                lastMessageId = content.success.id;
                                if (obj.callback) {
                                    adapter.sendTo(obj.from, obj.command, content.success, obj.callback);
                                }

                            } else {
                                if (obj.callback) {
                                    adapter.sendTo(obj.from, obj.command, {}, obj.callback);
                                }

                            }
                        },
                        'POST',
                        obj.message
                    ), 500);
            },
                'DELETE');
        } else {
            buildRequest(
                'device/notifications',
                content => {
                    adapter.log.debug('Response: ' + JSON.stringify(content));
                    if (content && content.success) {
                        lastMessageId = content.success.id;
                        if (obj.callback) {
                            adapter.sendTo(obj.from, obj.command, content.success, obj.callback);
                        }
                    } else {
                        if (obj.callback) {
                            adapter.sendTo(obj.from, obj.command, {}, obj.callback);
                        }
                    }
                },
                'POST',
                obj.message
            );

        }
    }
});

adapter.on('stateChange', (id, state) => {
    if (state && !state.ack) {
        // No ack = changed by user
        if (id === adapter.namespace + '.meta.display.brightness') {
            adapter.log.info('changing brightness to ' + state.val);

            buildRequest(
                'device/display',
                function(content) {},
                'PUT',
                {
                    brightness: state.val,
                    brightness_mode: 'manual'
                }
            );
        } else if (id === adapter.namespace + '.meta.audio.volume') {
            adapter.log.info('changing volume to ' + state.val);

            buildRequest(
                'device/audio',
                content => {},
                {
                    volume: state.val
                },
                'PUT',
                null
            );
        }
    }
});

adapter.on('ready', main);

function main() {
    adapter.subscribeStates('*');

    // Refresh State every Minute
    refreshState();
    setInterval(refreshState, 60000);
}

function refreshState() {
    adapter.log.debug('refreshing LaMetric state');

    buildRequest(
        'device',
        content => {
            adapter.setState('info.connection', true, true);

            adapter.setState('meta.name', {val: content.name, ack: true});
            adapter.setState('meta.serial', {val: content.serial_number, ack: true});
            adapter.setState('meta.version', {val: content.os_version, ack: true});
            adapter.setState('meta.model', {val: content.model, ack: true});
            adapter.setState('meta.mode', {val: content.mode, ack: true});

            adapter.setState('meta.audio.volume', {val: content.audio.volume, ack: true});

            adapter.setState('meta.bluetooth.available', {val: content.bluetooth.available, ack: true});
            adapter.setState('meta.bluetooth.name', {val: content.bluetooth.name, ack: true});
            adapter.setState('meta.bluetooth.active', {val: content.bluetooth.active, ack: true});
            adapter.setState('meta.bluetooth.discoverable', {val: content.bluetooth.discoverable, ack: true});
            adapter.setState('meta.bluetooth.pairable', {val: content.bluetooth.pairable, ack: true});
            adapter.setState('meta.bluetooth.address', {val: content.bluetooth.address, ack: true});

            adapter.setState('meta.display.brightness', {val: content.display.brightness, ack: true});
            adapter.setState('meta.display.brightness_mode', {val: content.display.brightness_mode, ack: true});
            adapter.setState('meta.display.width', {val: content.display.width, ack: true});
            adapter.setState('meta.display.height', {val: content.display.height, ack: true});
            adapter.setState('meta.display.type', {val: content.display.type, ack: true});

            adapter.setState('meta.wifi.active', {val: content.wifi.active, ack: true});
            adapter.setState('meta.wifi.address', {val: content.wifi.address, ack: true});
            adapter.setState('meta.wifi.available', {val: content.wifi.available, ack: true});
            adapter.setState('meta.wifi.encryption', {val: content.wifi.encryption, ack: true});
            adapter.setState('meta.wifi.ssid', {val: content.wifi.essid, ack: true});
            adapter.setState('meta.wifi.ip', {val: content.wifi.ip, ack: true});
            adapter.setState('meta.wifi.mode', {val: content.wifi.mode, ack: true});
            adapter.setState('meta.wifi.netmask', {val: content.wifi.netmask, ack: true});
            adapter.setState('meta.wifi.strength', {val: content.wifi.strength, ack: true});
        },
        'GET',
        null
    );
}

function buildRequest(service, callback, method, data) {
    const url = 'http://' + adapter.config.lametricIp + ':8080/api/v2/' + service;

    adapter.log.info('sending request to ' + url + ' with data: ' + JSON.stringify(data));

    request({
        url: url,
        method: method,
        json: data ? data : true,
        auth: {
            user: 'dev',
            pass: adapter.config.lametricToken,
            sendImmediately: true
        }
    },
    (error, response, content) => {
        if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
           callback(content);
        } else if (error) {
            adapter.log.error(error);
            callback();
        } else {
            adapter.log.error('Status Code: ' + response.statusCode + ' / Content: ' + JSON.stringify(content));
            callback();
        }
    });
}