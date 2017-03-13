[![view on npm](http://img.shields.io/npm/v/lws.svg)](https://www.npmjs.org/package/lws)
[![npm module downloads](http://img.shields.io/npm/dt/lws.svg)](https://www.npmjs.org/package/lws)
[![Build Status](https://travis-ci.org/75lb/lws.svg?branch=master)](https://travis-ci.org/75lb/lws)
[![Dependency Status](https://david-dm.org/75lb/lws.svg)](https://david-dm.org/75lb/lws)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

<a name="module_lws"></a>

## lws
A module for creating command-line web servers suitable for full-stack javascript development.


* [lws](#module_lws)
    * [Lws](#exp_module_lws--Lws) ⏏
        * [new Lws([options])](#new_module_lws--Lws_new)
        * [.start()](#module_lws--Lws+start)
        * [.getMiddlewareStack()](#module_lws--Lws+getMiddlewareStack) ⇒ <code>Array.&lt;middleware&gt;</code>
        * [.getServer()](#module_lws--Lws+getServer) ⇒ <code>Server</code>

<a name="exp_module_lws--Lws"></a>

### Lws ⏏
**Kind**: Exported class  
<a name="new_module_lws--Lws_new"></a>

#### new Lws([options])

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> | Server options |
| options.port} | <code>number</code> | Port |
| options.stack} | <code>Array.&lt;string&gt;</code> &#124; <code>Array.&lt;Features&gt;</code> | Port |

<a name="module_lws--Lws+start"></a>

#### lws.start()
Start the app.

**Kind**: instance method of <code>[Lws](#exp_module_lws--Lws)</code>  
<a name="module_lws--Lws+getMiddlewareStack"></a>

#### lws.getMiddlewareStack() ⇒ <code>Array.&lt;middleware&gt;</code>
Returns and array of middleware functions from a given stack.

**Kind**: instance method of <code>[Lws](#exp_module_lws--Lws)</code>  
<a name="module_lws--Lws+getServer"></a>

#### lws.getServer() ⇒ <code>Server</code>
Returns a listening server which processes requests using the middleware supplied.

**Kind**: instance method of <code>[Lws](#exp_module_lws--Lws)</code>  


* * *

&copy; 2016-17 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
