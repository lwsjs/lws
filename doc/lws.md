<a name="module_lws"></a>

## lws

* [lws](#module_lws)
    * [Lws](#exp_module_lws--Lws) ⏏
        * [.listen([options])](#module_lws--Lws+listen) ⇒ <code>Server</code>
        * [.createServer()](#module_lws--Lws+createServer) ⇒ <code>Server</code>

<a name="exp_module_lws--Lws"></a>

### Lws ⏏
**Kind**: Exported class  
**Emits**: <code>event:verbose</code>  
<a name="module_lws--Lws+listen"></a>

#### lws.listen([options]) ⇒ <code>Server</code>
Returns a listening HTTP/HTTPS server.

**Kind**: instance method of [<code>Lws</code>](#exp_module_lws--Lws)  

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
| [options.server] | <code>string</code> \| <code>ServerFactory</code> | Custom server factory, e.g. lws-http2. |
| [options.moduleDir] | <code>Array.&lt;string&gt;</code> | One or more directories to search for middleware modules. |

<a name="module_lws--Lws+createServer"></a>

#### lws.createServer() ⇒ <code>Server</code>
Returns a HTTP, HTTPS or HTTP2 server instance.

**Kind**: instance method of [<code>Lws</code>](#exp_module_lws--Lws)  
