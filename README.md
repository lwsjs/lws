[![view on npm](https://img.shields.io/npm/v/lws.svg)](https://www.npmjs.org/package/lws)
[![npm module downloads](https://img.shields.io/npm/dt/lws.svg)](https://www.npmjs.org/package/lws)
[![Build Status](https://travis-ci.org/lwsjs/lws.svg?branch=master)](https://travis-ci.org/lwsjs/lws)
[![Dependency Status](https://badgen.net/david/dep/lwsjs/lws)](https://david-dm.org/lwsjs/lws)
[![Coverage Status](https://coveralls.io/repos/github/lwsjs/lws/badge.svg)](https://coveralls.io/github/lwsjs/lws)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

# lws

A lean, modular web server for rapid full-stack development.

Lws is an application core for quickly launching a local web server. Behaviour is added via plugins giving you full control over how requests are processed and responses created.

* Supports HTTP, HTTPS and HTTP2.
* Small and 100% personalisable. Load and use only the behaviour required by your project.
* Attach a custom view to personalise how activity is visualised.
* Programmatic and command-line APIs.

## Synopsis

### Core usage

Launch an HTTP server on the default port of 8000.

```
$ lws
Listening at http://mba4.local:8000, http://127.0.0.1:8000, http://192.168.0.200:8000
```

For HTTPS or HTTP2, pass the `--https` or `--http2` flags respectively.

```
$ lws --http2
Listening at https://mba4.local:8000, https://127.0.0.1:8000, https://192.168.0.200:8000
```

Now your server is running, the next step is to attach some middleware to process requests.

### Using middleware plugins

Install and use some middleware ([lws-static](https://github.com/lwsjs/static) and [lws-index](https://github.com/lwsjs/index)) to serve static files and directory listings.

```
$ npm install --save-dev lws-static lws-index

$ lws --stack lws-static lws-index
Listening at http://mba4.local:8000, http://127.0.0.1:8000, http://192.168.0.200:8000
```

The current directory will now be available to explore at `http://127.0.0.1:8000`.

Install and use logging middleware. Note the `lws-` prefix is optional when supplying module names to `--stack`.

```
$ npm install --save-dev lws-log

$ lws --stack log static index --log.format combined
Listening at http://mba4.local:8000, http://127.0.0.1:8000, http://192.168.0.200:8000
::ffff:127.0.0.1 - GET /lws.config.js HTTP/1.1 200 52 - 8.259 ms
::ffff:127.0.0.1 - GET /package.json HTTP/1.1 200 399 - 1.478 ms
```

### Creating a custom middleware plugin

Lws uses [Koa](https://github.com/koajs/koa/) as its middleware engine. Here is a trivial plugin example, save the following code as `example-middleware.js`:

```js
class ExamplePlugin {
  middleware () {
    return async (ctx, next) => {
      ctx.body = 'Hello from lws!'
      await next()
    }
  }
}

module.exports = ExamplePlugin
```

Now launch an HTTP server using this middleware.

```
$ lws --stack example-middleware.js
Listening at http://mba4.local:8000, http://127.0.0.1:8000, http://192.168.0.200:8000

$ curl http://127.0.0.1:8000
Hello from lws!
```

## Install

```
$ npm install --save-dev lws
```

## Documentation

* API Reference
    * [Lws](https://github.com/lwsjs/lws/blob/master/doc/lws.md)
    * [Middleware plugin](https://github.com/lwsjs/lws/blob/master/doc/middleware-plugin.md)
    * [View plugin](https://github.com/lwsjs/lws/blob/master/doc/view-plugin.md)

## See also

* [lws plugin list](https://npms.io/search?q=keywords%3Alws-middleware).
* [local-web-server](https://github.com/lwsjs/local-web-server), an lws distribution with the most common plugins already installed.

* * *

&copy; 2016-20 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
