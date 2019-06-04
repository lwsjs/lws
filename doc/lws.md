<a name="module_lws"></a>

## lws

* [lws](#module_lws)
    * [Lws](#exp_module_lws--Lws) ⏏
        * [new Lws(config)](#new_module_lws--Lws_new)
        * [.server](#module_lws--Lws+server) : <code>Server</code>
        * [.stack](#module_lws--Lws+stack) : <code>MiddlewareStack</code>
        * [.config](#module_lws--Lws+config) : <code>LwsConfig</code>
        * [.createServer()](#module_lws--Lws+createServer) ⇒ <code>Server</code>
        * [.useMiddlewareStack([options])](#module_lws--Lws+useMiddlewareStack)
        * ["verbose" (key, value)](#module_lws--Lws+event_verbose)

<a name="exp_module_lws--Lws"></a>

### Lws ⏏
**Kind**: Exported class  
**Emits**: <code>event:verbose</code>  
<a name="new_module_lws--Lws_new"></a>

#### new Lws(config)

| Param | Type | Description |
| --- | --- | --- |
| config | <code>LwsConfig</code> | Server config. |

<a name="module_lws--Lws+server"></a>

#### lws.server : <code>Server</code>
The HTTP, HTTPS or HTTP2 server.

**Kind**: instance property of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+stack"></a>

#### lws.stack : <code>MiddlewareStack</code>
The middleware plugin stack.

**Kind**: instance property of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+config"></a>

#### lws.config : <code>LwsConfig</code>
Active config.

**Kind**: instance property of [<code>Lws</code>](#exp_module_lws--Lws)  
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

<a name="module_lws--Lws+event_verbose"></a>

#### "verbose" (key, value)
Highly-verbose debug information event stream.

**Kind**: event emitted by [<code>Lws</code>](#exp_module_lws--Lws)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | An identifying string, e.g. `server.socket.data`. |
| value | <code>\*</code> | The value, e.g. `{ socketId: 1, bytesRead: '3 Kb' }`. |

