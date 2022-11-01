'use strict';

/**
 * @class
 * @param {object} server http or https node.js object
 * @param {object} webSettings settings of the web server, like <pre><code>{secure: settings.secure, port: settings.port}</code></pre>
 * @param {object} adapter web adapter object
 * @param {object} instanceSettings instance object with common and native
 * @param {object} app express application
 * @return {object} class instance
 */
function LaMetricWebExtension(server, webSettings, adapter, instanceSettings, app) {
    this.app = app;
    this.adapter = adapter;
    this.settings = webSettings;
    this.config = instanceSettings ? instanceSettings.native : {};
    this.namespace = instanceSettings ? instanceSettings._id.substring('system.adapter.'.length) : 'lametric';

    const that = this;

    this.unload = () => {
        return new Promise((resolve) => {
            this.adapter.log.debug(`${this.namespace} extension unloaded!`);

            // unload app path
            const middlewareIndex = app._router.stack.findIndex((layer) => layer && layer.route === `/${this.namespace}/`);

            if (middlewareIndex !== -1) {
                // Remove the matched middleware
                app._router.stack.splice(middlewareIndex, 1);
            }

            resolve(true);
        });
    };

    // Optional. Say to web instance to wait till this instance is initialized
    // Used if initalisation lasts some time
    this.readyCallback = null;
    this.waitForReady = (cb) => {
        this.readyCallback = cb;
    };

    // self invoke constructor
    (function __constructor() {
        if (that.settings.secure) {
            that.adapter.log.error(`Unable to register ${that.namespace} web extension - HTTPS is not supported by LaMetric`);
        } else {
            that.adapter.log.info(`${that.namespace} server listening on port http://${that.adapter.config.bind}:${that.settings.port}/${that.namespace}/`);

            if (that.app) {
                that.app.use(`/${that.namespace}/`, (req, res) => {
                    adapter.log.debug(`Received ${req.method} request on ${req.url}`);

                    res.setHeader('Content-Type', 'application/json; charset=utf-8');

                    if (req.method == 'GET') {
                        try {
                            adapter.getForeignState(`${that.namespace}.mydatadiy.obj`, (err, state) => {
                                if (!err && state && state.val) {
                                    res.status(200).send(state.val);
                                } else {
                                    res.status(500).send(JSON.stringify({ error: `unable to read state ${that.namespace}.mydatadiy.obj` }));
                                }
                            });
                        } catch (err) {
                            res.status(500).send(JSON.stringify({ error: err }));
                        }
                    } else {
                        res.status(500).send(JSON.stringify({ error: 'unsupported method' }));
                    }
                });
            }
        }

        // inform web about that all routes are installed
        that.readyCallback && that.readyCallback(that);
    })();
}

module.exports = LaMetricWebExtension;
