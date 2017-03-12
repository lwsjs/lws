#!/usr/bin/env node
'use strict'
const Lws = require('../')
// const Spa = require('local-web-server-spa')
// const Static = require('local-web-server-static')
const lws = new Lws({
  // stack: [ Spa, Static, 'server/websocket-server.js' ],
  // port: 8010,
  // spa: 'index.html',
  // 'static.root': 'client'
})
lws.listen()
