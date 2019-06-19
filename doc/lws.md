<a name="module_lws"></a>

## lws
A lean, modular web server for rapid full-stack development.

Lws is an application core for quickly launching a local web server. Behaviour is added via plugins giving you full control over how requests are processed and responses created.

* Supports HTTP, HTTPS and HTTP2.
* Small and 100% personalisable. Load and use only the behaviour required by your project.
* Attach a custom view to personalise how activity is visualised.
* Programmatic and command-line APIs.

**Example**  
```js
// Middleware to handle requests
class Greeter {
  middleware () {
    return (ctx, next) => {
      ctx.body = 'Hello!'
      next()
    }
  }
}

// Launch a HTTP server with the Greeter middleware attached
const lws = Lws.create({ stack: Greeter })

// $ curl http://127.0.0.1:8000
// Hello!

// shutdown
lws.server.close()
```

* [lws](#module_lws)
    * [Lws](#exp_module_lws--Lws) ⏏
        * [new Lws(config)](#new_module_lws--Lws_new)
        * _instance_
            * [.server](#module_lws--Lws+server) : <code>Server</code>
            * [.stack](#module_lws--Lws+stack) : <code>MiddlewareStack</code>
            * [.config](#module_lws--Lws+config) : [<code>LwsConfig</code>](https://github.com/lwsjs/lws/blob/master/doc/config.md)
            * [.createServer()](#module_lws--Lws+createServer) ⇒ <code>Server</code>
            * [.useMiddlewareStack()](#module_lws--Lws+useMiddlewareStack)
            * [.useView()](#module_lws--Lws+useView)
            * ["verbose" (key, value)](#module_lws--Lws+event_verbose)
        * _static_
            * [.create(config)](#module_lws--Lws.create) ⇒ <code>Lws</code>

<a name="exp_module_lws--Lws"></a>

### Lws ⏏
**Kind**: Exported class  
**Emits**: <code>event:verbose</code>  
<a name="new_module_lws--Lws_new"></a>

#### new Lws(config)
Contructs an empty `Lws` instance but does not initialise it. Use the `Lws.create(config)` factory method to create, initialise and launch a lws server.


| Param | Type | Description |
| --- | --- | --- |
| config | [<code>LwsConfig</code>](https://github.com/lwsjs/lws/blob/master/doc/config.md) | Server config. |

<a name="module_lws--Lws+server"></a>

#### lws.server : <code>Server</code>
The output of Node's standard http, https or http2 `.createServer()` method. Created and set by `lws.createServer()`.

**Kind**: instance property of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+stack"></a>

#### lws.stack : <code>MiddlewareStack</code>
The middleware plugin stack as defined by the config. Created and set by `lws.useMiddlewareStack()`.

**Kind**: instance property of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+config"></a>

#### lws.config : [<code>LwsConfig</code>](https://github.com/lwsjs/lws/blob/master/doc/config.md)
The active lws config.

**Kind**: instance property of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+createServer"></a>

#### lws.createServer() ⇒ <code>Server</code>
Create a HTTP, HTTPS or HTTP2 server, depending on config. Returns the output of Node's standard http, https or http2 `.createServer()` method also assigning it to `lws.server`.

**Kind**: instance method of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+useMiddlewareStack"></a>

#### lws.useMiddlewareStack()
Attach the Middleware stack to the server. Must be run after `lws.createServer()`.

**Kind**: instance method of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+useView"></a>

#### lws.useView()
Attach the view specified in the config.

**Kind**: instance method of [<code>Lws</code>](#exp_module_lws--Lws)  
<a name="module_lws--Lws+event_verbose"></a>

#### "verbose" (key, value)
An event stream of debug information.

**Kind**: event emitted by [<code>Lws</code>](#exp_module_lws--Lws)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | An identifying string, e.g. `server.socket.data`. |
| value | <code>\*</code> | The value, e.g. `{ socketId: 1, bytesRead: '3 Kb' }`. |

<a name="module_lws--Lws.create"></a>

#### Lws.create(config) ⇒ <code>Lws</code>
Launch a listening HTTP, HTTPS or HTTP2 server configured as specified by the supplied config.

**Kind**: static method of [<code>Lws</code>](#exp_module_lws--Lws)  

| Param | Type |
| --- | --- |
| config | [<code>LwsConfig</code>](https://github.com/lwsjs/lws/blob/master/doc/config.md) | 

