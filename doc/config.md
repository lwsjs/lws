<a name="module_lws-config"></a>

## lws-config
The lws configuration options.


* [lws-config](#module_lws-config)
    * [LwsConfig](#exp_module_lws-config--LwsConfig) ⏏
        * [.port](#module_lws-config--LwsConfig+port) : <code>number</code>
        * [.hostname](#module_lws-config--LwsConfig+hostname) : <code>string</code>
        * [.maxConnections](#module_lws-config--LwsConfig+maxConnections) : <code>number</code>
        * [.keepAliveTimeout](#module_lws-config--LwsConfig+keepAliveTimeout) : <code>number</code>
        * [.configFile](#module_lws-config--LwsConfig+configFile) : <code>string</code>
        * [.https](#module_lws-config--LwsConfig+https) : <code>boolean</code>
        * [.http2](#module_lws-config--LwsConfig+http2) : <code>boolean</code>
        * [.key](#module_lws-config--LwsConfig+key) : <code>string</code>
        * [.cert](#module_lws-config--LwsConfig+cert) : <code>string</code>
        * [.pfx](#module_lws-config--LwsConfig+pfx) : <code>string</code>
        * [.ciphers](#module_lws-config--LwsConfig+ciphers) : <code>string</code>
        * [.secureProtocol](#module_lws-config--LwsConfig+secureProtocol) : <code>string</code>
        * [.stack](#module_lws-config--LwsConfig+stack) : <code>Array.&lt;string&gt;</code> \| [<code>Array.&lt;MiddlewarePlugin&gt;</code>](https://github.com/lwsjs/lws/blob/master/doc/middleware-plugin.md)
        * [.moduleDir](#module_lws-config--LwsConfig+moduleDir) : <code>string</code> \| <code>Array.&lt;string&gt;</code>
        * [.view](#module_lws-config--LwsConfig+view) : <code>string</code>
        * [.title](#module_lws-config--LwsConfig+title) : <code>string</code>

<a name="exp_module_lws-config--LwsConfig"></a>

### LwsConfig ⏏
**Kind**: Exported class  
<a name="module_lws-config--LwsConfig+port"></a>

#### lwsConfig.port : <code>number</code>
The port number to listen on.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
**Default**: <code>8000</code>  
<a name="module_lws-config--LwsConfig+hostname"></a>

#### lwsConfig.hostname : <code>string</code>
The hostname or IP address to bind to.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
**Default**: <code>&quot;0.0.0.0&quot;</code>  
<a name="module_lws-config--LwsConfig+maxConnections"></a>

#### lwsConfig.maxConnections : <code>number</code>
**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
**Default**: <code></code>  
<a name="module_lws-config--LwsConfig+keepAliveTimeout"></a>

#### lwsConfig.keepAliveTimeout : <code>number</code>
**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
**Default**: <code>5000</code>  
<a name="module_lws-config--LwsConfig+configFile"></a>

#### lwsConfig.configFile : <code>string</code>
Filename to retrieve stored config from. Defaults to the first found of "lws.config.js", "lws.config.mjs" or "lws.config.cjs". Config files with the `.js` extension must always be a CommonJS module.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
<a name="module_lws-config--LwsConfig+https"></a>

#### lwsConfig.https : <code>boolean</code>
Enable HTTPS using a built-in TLS certificate registered to the hosts 127.0.0.1 and localhost.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
**Default**: <code>false</code>  
<a name="module_lws-config--LwsConfig+http2"></a>

#### lwsConfig.http2 : <code>boolean</code>
Enable HTTP2 using a built-in TLS certificate registered to the hosts 127.0.0.1 and localhost.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
**Default**: <code>false</code>  
<a name="module_lws-config--LwsConfig+key"></a>

#### lwsConfig.key : <code>string</code>
Private key. Supply along with `cert` to launch a secure server.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
<a name="module_lws-config--LwsConfig+cert"></a>

#### lwsConfig.cert : <code>string</code>
Certificate chain. Supply along with `key` to launch a secure server.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
<a name="module_lws-config--LwsConfig+pfx"></a>

#### lwsConfig.pfx : <code>string</code>
Optional PFX or PKCS12 encoded private key and certificate chain. An alternative to providing `key` and `cert`.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
<a name="module_lws-config--LwsConfig+ciphers"></a>

#### lwsConfig.ciphers : <code>string</code>
Optional cipher suite specification, replacing the built-in default.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
<a name="module_lws-config--LwsConfig+secureProtocol"></a>

#### lwsConfig.secureProtocol : <code>string</code>
Optional SSL method to use.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
<a name="module_lws-config--LwsConfig+stack"></a>

#### lwsConfig.stack : <code>Array.&lt;string&gt;</code> \| [<code>Array.&lt;MiddlewarePlugin&gt;</code>](https://github.com/lwsjs/lws/blob/master/doc/middleware-plugin.md)
Array of middleware classes, or filenames of modules exporting a middleware class.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
<a name="module_lws-config--LwsConfig+moduleDir"></a>

#### lwsConfig.moduleDir : <code>string</code> \| <code>Array.&lt;string&gt;</code>
One or more directories to search for middleware modules.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
**Default**: <code>&quot;[\&quot;.\&quot;]&quot;</code>  
<a name="module_lws-config--LwsConfig+view"></a>

#### lwsConfig.view : <code>string</code>
Custom view instance.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
**Default**: <code>null</code>  
<a name="module_lws-config--LwsConfig+title"></a>

#### lwsConfig.title : <code>string</code>
Give the process a more useful title than the default `node`. This helps to find your server in utilities like `ps`, Task Manager, Activity Monitor etc.

**Kind**: instance property of [<code>LwsConfig</code>](#exp_module_lws-config--LwsConfig)  
**Default**: <code>null</code>  
