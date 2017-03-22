[![view on npm](http://img.shields.io/npm/v/lws.svg)](https://www.npmjs.org/package/lws)
[![npm module downloads](http://img.shields.io/npm/dt/lws.svg)](https://www.npmjs.org/package/lws)
[![Build Status](https://travis-ci.org/75lb/lws.svg?branch=master)](https://travis-ci.org/75lb/lws)
[![Dependency Status](https://david-dm.org/75lb/lws.svg)](https://david-dm.org/75lb/lws)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

# lws

A application shell for creating modular, command-line web servers for productive front-end development.

## Synopsis

Running `lws` launches a web server.

```
$ lws
Serving at http://mbp.local:8000, http://127.0.0.1:8000, http://192.168.0.32:8000
```

However, by default it's empty.

```
$ curl -I http://127.0.0.1:8000/README.md
HTTP/1.1 404 Not Found
Date: Wed, 22 Mar 2017 20:41:07 GMT
Connection: keep-alive
```

You install and use features.

```
$ npm install lws-static
$ curl -I http://127.0.0.1:8000/README.md
HTTP/1.1 200 OK
Content-Length: 3286
Last-Modified: Wed, 22 Mar 2017 00:22:21 GMT
Cache-Control: max-age=0
Content-Type: text/x-markdown; charset=utf-8
Date: Wed, 22 Mar 2017 20:39:18 GMT
Connection: keep-alive
```

You can use a pre-build feature or make your own.

```js
class Feature {
  middleware (options) {
    return (ctx, next) => {
      ctx.body = 'Example feature.'
    }
  }
}

module.exports = Feature
```

If you want a server with all the common features pre-installed, look at [local-web-server](https://github.com/75lb/local-web-server).

# API Reference

<a name="module_lws"></a>

## lws
A module for creating command-line web servers suitable for full-stack javascript development.


* [lws](#module_lws)
    * [Lws](#exp_module_lws--Lws) ⏏
        * [new Lws([options])](#new_module_lws--Lws_new)
        * [.app](#module_lws--Lws.Lws+app)
        * [.server](#module_lws--Lws.Lws+server)
        * [.features](#module_lws--Lws.Lws+features) : <code>[Array.&lt;Feature&gt;](#Feature)</code>
        * [.start()](#module_lws--Lws+start)
        * [.getMiddlewares()](#module_lws--Lws+getMiddlewares) ⇒ <code>Array.&lt;middleware&gt;</code>
        * [.getServer()](#module_lws--Lws+getServer) ⇒ <code>Server</code>
        * [.getStoredConfig()](#module_lws--Lws+getStoredConfig) ⇒ <code>object</code>

<a name="exp_module_lws--Lws"></a>

### Lws ⏏
**Kind**: Exported class  
<a name="new_module_lws--Lws_new"></a>

#### new Lws([options])

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> | Server options |
| options.port} | <code>number</code> | Port |
| options.hostname} | <code>string</code> | The hostname (or IP address) to listen on. Defaults to 0.0.0.0. |
| options.config-file} | <code>string</code> | Config file, defaults to 'lws.config.js'. |
| options.stack} | <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Features&gt;</code> | Array of feature classes, or filenames of modules exporting a feature class. |
| options.https} | <code>boolean</code> | Enable HTTPS using a built-in key and cert, registered to the domain 127.0.0.1. |
| options.key} | <code>string</code> | SSL key. Supply along with --cert to launch a https server. |
| options.cert} | <code>string</code> | SSL cert. Supply along with --key to launch a https server. |

<a name="module_lws--Lws.Lws+app"></a>

#### lws.app
Koa app

**Kind**: instance property of <code>[Lws](#exp_module_lws--Lws)</code>  
<a name="module_lws--Lws.Lws+server"></a>

#### lws.server
node server

**Kind**: instance property of <code>[Lws](#exp_module_lws--Lws)</code>  
<a name="module_lws--Lws.Lws+features"></a>

#### lws.features : <code>[Array.&lt;Feature&gt;](#Feature)</code>
Feature instances

**Kind**: instance property of <code>[Lws](#exp_module_lws--Lws)</code>  
<a name="module_lws--Lws+start"></a>

#### lws.start()
Start the app.

**Kind**: instance method of <code>[Lws](#exp_module_lws--Lws)</code>  
<a name="module_lws--Lws+getMiddlewares"></a>

#### lws.getMiddlewares() ⇒ <code>Array.&lt;middleware&gt;</code>
Returns and array of middleware functions from a given stack.

**Kind**: instance method of <code>[Lws](#exp_module_lws--Lws)</code>  
<a name="module_lws--Lws+getServer"></a>

#### lws.getServer() ⇒ <code>Server</code>
Returns a listening server which processes requests using the middleware supplied.

**Kind**: instance method of <code>[Lws](#exp_module_lws--Lws)</code>  
<a name="module_lws--Lws+getStoredConfig"></a>

#### lws.getStoredConfig() ⇒ <code>object</code>
Return stored config object.

**Kind**: instance method of <code>[Lws](#exp_module_lws--Lws)</code>  


* * *

&copy; 2016-17 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
