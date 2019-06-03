<a name="module_lws"></a>

## lws

* [lws](#module_lws)
    * [Lws](#exp_module_lws--Lws) ⏏
        * [new Lws([options])](#new_module_lws--Lws_new)
        * [.server](#module_lws--Lws+server) : <code>Server</code>
        * [.middlewareStack](#module_lws--Lws+middlewareStack) : <code>MiddlewareStack</code>
        * [.config](#module_lws--Lws+config) : <code>object</code>
        * [.getDefaultConfig()](#module_lws--Lws+getDefaultConfig) ⇒ <code>object</code>
        * [.setConfig(config)](#module_lws--Lws+setConfig) ⇒ <code>object</code>
        * [.setStack()](#module_lws--Lws+setStack)
        * [.createServer()](#module_lws--Lws+createServer) ⇒ <code>Server</code>
        * [.useMiddlewareStack([options])](#module_lws--Lws+useMiddlewareStack)
        * [.getRequestHandler(middlewares)](#module_lws--Lws+getRequestHandler) ⇒ <code>function</code>

<a name="exp_module_lws--Lws"></a>

### Lws ⏏
**Kind**: Exported class  
**Emits**: <code>event:verbose</code>  
<a name="new_module_lws--Lws_new"></a>

#### new Lws([options])
Returns a listening HTTP/HTTPS/HTTP2 server.


| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> | Server options |
| [options.port] | <code>number</code> | Port |
| [options.hostname] | <code>string</code> | The hostname (or IP address) to listen on. Defaults to 0.0.0.0. |
| [options.maxConnections] | <code>number</code> | The maximum number of concurrent connections supported by the server. |
| [options.keepAliveTimeout] | <code>number</code> | The period (in milliseconds) of inactivity a connection will remain open before being destroyed. Set to `0` to keep connections open indefinitely. |
| [options.configFile] | <code>string</code> | Config file path, defaults to 'lws.config.js'. |
| [options.https] | <code>boolean</code> | Enable HTTPS using a built-in key and cert registered to the domain 127.0.0.1. |
| [options.key] | <code>string</code> | SSL key file path. Supply along with --cert to launch a https server. |
| [options.cert] | <code>string</code> | SSL cert file path. Supply along with --key to launch a https server. |
| [options.pfx] | <code>string</code> | Path to an PFX or PKCS12 encoded private key and certificate chain. An alternative to providing --key and --cert. |
| [options.ciphers] | <code>string</code> | Optional cipher suite specification, replacing the default. |
| [options.secureProtocol] | <code>string</code> | Optional SSL method to use, default is "SSLv23_method". |
| [options.stack] | <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Middlewares&gt;</code> | Array of middleware classes, or filenames of modules exporting a middleware class. |
| [options.moduleDir] | <code>Array.&lt;string&gt;</code> | One or more directories to search for middleware modules. |
| [options.modulePrefix] | <code>string</code> | An optional string to prefix to module names when loading middleware modules Defaults to 'lws-'. |
| [options.view] | <code>object</code> | View instance. |

<a name="module_lws--Lws+server"></a>

#### lws.server : <code>Server</code>
The HTTP, HTTPS or HTTP2 server.

**Kind**: instance property of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+middlewareStack"></a>

#### lws.middlewareStack : <code>MiddlewareStack</code>
The middleware plugin stack.

**Kind**: instance property of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+config"></a>

#### lws.config : <code>object</code>
Active config.

**Kind**: instance property of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+getDefaultConfig"></a>

#### lws.getDefaultConfig() ⇒ <code>object</code>
Get built-in defaults.

**Kind**: instance method of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+setConfig"></a>

#### lws.setConfig(config) ⇒ <code>object</code>
Merge supplied config with defaults and stored config.

**Kind**: instance method of [<code>Lws</code>](#exp_module_lws--Lws)  

| Param | Type |
| --- | --- |
| config | <code>object</code> | 

<a name="module_lws--Lws+setStack"></a>

#### lws.setStack()
Sets the middleware stack, loading plugins if supplied.

**Kind**: instance method of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+createServer"></a>

#### lws.createServer() ⇒ <code>Server</code>
Create a HTTP, HTTPS or HTTP2 server, depending on config. Returns the output of Node's standard http, https or http2 `.createServer()` method.

**Kind**: instance method of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+useMiddlewareStack"></a>

#### lws.useMiddlewareStack([options])
Attach the Middleware stack to the server.

**Kind**: instance method of [<code>Lws</code>](#exp_module_lws--Lws)  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> | Arbitrary options to be passed into the middleware functions. |

<a name="module_lws--Lws+getRequestHandler"></a>

#### lws.getRequestHandler(middlewares) ⇒ <code>function</code>
Override this method to use a means other than Koa to handle requests.

**Kind**: instance method of [<code>Lws</code>](#exp_module_lws--Lws)  

| Param | Type |
| --- | --- |
| middlewares | <code>Array.&lt;function()&gt;</code> | 

