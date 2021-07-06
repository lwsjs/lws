/**
 * The lws configuration options.
 * @module lws-config
 */

/**
 * @external MiddlewarePlugin
 * @see https://github.com/lwsjs/lws/blob/master/doc/middleware-plugin.md
 */

/**
 * @alias module:lws-config
 */
class LwsConfig {
  constructor () {
    /**
     * The port number to listen on.
     * @type {number}
     * @default
     */
    this.port = 8000

    /**
     * The hostname or IP address to bind to.
     * @type {string}
     * @default
     */
    this.hostname = '0.0.0.0'

    /**
     *
     * @type {number}
     * @default
     */
    this.maxConnections = null

    /**
     *
     * @type {number}
     * @default
     */
    this.keepAliveTimeout = 5000

    /**
     * Filename to retrieve stored config from. Defaults to the first found of "lws.config.js", "lws.config.mjs" or "lws.config.cjs". Config files with the `.js` extension must always be a CommonJS module.
     * @type {string}
     * @default
     */
    this.configFile = undefined

    /**
     * Enable HTTPS using a built-in TLS certificate registered to the hosts 127.0.0.1 and localhost.
     * @type {boolean}
     * @default
     */
    this.https = false

    /**
     * Enable HTTP2 using a built-in TLS certificate registered to the hosts 127.0.0.1 and localhost.
     * @type {boolean}
     * @default
     */
    this.http2 = false

    /**
     * Private key. Supply along with `cert` to launch a secure server.
     * @type {string}
     */
    this.key = null

    /**
     * Certificate chain. Supply along with `key` to launch a secure server.
     * @type {string}
     */
    this.cert = null

    /**
     * Optional PFX or PKCS12 encoded private key and certificate chain. An alternative to providing `key` and `cert`.
     * @type {string}
     */
    this.pfx = null

    /**
     * Optional cipher suite specification, replacing the built-in default.
     * @type {string}
     */
    this.ciphers = null

    /**
     * Optional SSL method to use.
     * @type {string}
     */
    this.secureProtocol = null

    /**
     * Array of middleware classes, or filenames of modules exporting a middleware class.
     * @type {string[]|external:MiddlewarePlugin[]}
     */
    this.stack = null

    /**
     * One or more directories to search for middleware modules.
     * @type {string|string[]}
     * @default
     */
    this.moduleDir = ['.']

    /**
     * Custom view instance.
     * @type {string}
     * @default
     */
    this.view = null
  }
}

export default LwsConfig
