'use strict';

/**
 * Proxy class
 *
 * Read files from localhost server
 *
 * @param {object} server http or https node.js object
 * @param {object} webSettings settings of the web server, like <pre><code>{secure: settings.secure, port: settings.port}</code></pre>
 * @param {object} adapter web adapter object
 * @param {object} instanceSettings instance object with common and native
 * @param {object} app express application
 * @returns {object} object instance
 */
class LaMetricWebExtension {
    constructor(server, webSettings, adapter, instanceSettings, app) {
        this.app = app;
        this.adapter = adapter;
        this.settings = webSettings;
        this.config = instanceSettings ? instanceSettings.native : {};
        this.namespace = instanceSettings ? instanceSettings._id.substring('system.adapter.'.length) : 'lametric';

        this.appPath = `/${this.namespace}/`;
    }

    waitForReady(cb) {
        if (this.settings.secure) {
            this.adapter.log.error(
                `Unable to register ${this.namespace} web extension - HTTPS is not supported by LaMetric`,
            );
        } else {
            if (this.app && this.config.type === 'poll') {
                this.app.use(this.appPath, (req, res) => {
                    this.adapter.log.debug(`Received ${req.method} request on ${req.url}`);

                    res.setHeader('Content-Type', 'application/json; charset=utf-8');

                    if (req.method == 'GET') {
                        try {
                            this.adapter.getForeignState(`${this.namespace}.mydatadiy.obj`, (err, state) => {
                                if (!err && state && state.val) {
                                    res.status(200).send(state.val);
                                } else {
                                    res.status(500).send(
                                        JSON.stringify({
                                            error: `unable to read state ${this.namespace}.mydatadiy.obj`,
                                        }),
                                    );
                                }
                            });
                        } catch (err) {
                            res.status(500).send(JSON.stringify({ error: err }));
                        }
                    } else {
                        res.status(500).send(JSON.stringify({ error: 'unsupported method' }));
                    }
                });

                this.adapter.log.info(
                    `${this.namespace} server listening on port http://${this.adapter.config.bind}:${this.settings.port}/${this.namespace}/`,
                );
            }
        }

        cb();
    }

    unload() {
        return new Promise(resolve => {
            this.adapter.log.debug(`${this.namespace} extension unloaded!`);

            // unload app path
            const middlewareIndex = this.app._router.stack.findIndex(layer => layer && layer.route === this.appPath);
            if (middlewareIndex !== -1) {
                // Remove the matched middleware
                this.app._router.stack.splice(middlewareIndex, 1);
            }

            resolve(true);
        });
    }
}

module.exports = LaMetricWebExtension;
