[![view on npm](https://img.shields.io/npm/v/lws.svg)](https://www.npmjs.org/package/lws)
[![npm module downloads](https://img.shields.io/npm/dt/lws.svg)](https://www.npmjs.org/package/lws)
[![Build Status](https://travis-ci.org/lwsjs/lws.svg?branch=master)](https://travis-ci.org/lwsjs/lws)
[![Dependency Status](https://badgen.net/david/dep/lwsjs/lws)](https://david-dm.org/lwsjs/lws)
[![Coverage Status](https://coveralls.io/repos/github/lwsjs/lws/badge.svg)](https://coveralls.io/github/lwsjs/lws)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

# lws

***This documentation is a work in progress.***

Lws is a tool for quickly launching a personalised Node.js HTTP, HTTPS or HTTP2 server. It's intended to facilitate rapid, full-stack Javascript development. It has a lean core and plugin architecture to give the engineer full control over what features are activated, how HTTP requests are handled and responses created.

Core features.

* Launch an HTTP, HTTPS or HTTP2 server.
* Attach one or more custom or pre-built middleware plugins to handle requests as required by your project.
* Attach a custom view to visualise activity.
* Store config at any level - project, user or system.
* Programmatic and command-line APIs.

## Synopsis

Launch an HTTP server on the default port of 8000.

```
$ lws
Listening at http://mba4.local:8000, http://127.0.0.1:8000, http://192.168.0.200:8000
```

Install and use some middleware to serve static files and directory listings.

```
$ npm install --save-dev lws-static lws-index

$ lws --stack lws-static lws-index
Listening at http://mba4.local:8000, http://127.0.0.1:8000, http://192.168.0.200:8000
```

The file system from the current directory will now be available to explore at http://127.0.0.1:8000.

Install and use logging middleware. Note the `lws-` prefix is optional when supplying module names to `--stack`.

```
$ npm install --save-dev lws-log

$ lws --stack log static index --log.format combined
Listening at http://mba4.local:8000, http://127.0.0.1:8000, http://192.168.0.200:8000
::ffff:127.0.0.1 - GET /lws.config.js HTTP/1.1 200 52 - 8.259 ms
::ffff:127.0.0.1 - GET /package.json HTTP/1.1 200 399 - 1.478 ms
```

* * *

&copy; 2016-19 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
