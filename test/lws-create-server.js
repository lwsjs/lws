const Tom = require('test-runner').Tom
const a = require('assert')
const Lws = require('../index')
const fetch = require('node-fetch')

const tom = module.exports = new Tom('lws-create-server')

const https = require('https')
const agent = new https.Agent({
  rejectUnauthorized: false
})

tom.test('invalid options 1', function () {
  const lws = new Lws({ cert: 'something' })
  a.throws(
    () => lws.createServer(),
    /--key and --cert must always be supplied together/
  )
})

tom.test('invalid options 2', function () {
  const lws = new Lws({ key: 'something' })
  a.throws(
    () => lws.createServer(),
    /--key and --cert must always be supplied together/
  )
})

tom.test('invalid options 3', function () {
  const lws = new Lws({ https: true, pfx: 'something' })
  a.throws(
    () => lws.createServer(),
    /use one of --https or --pfx, not both/
  )
})

tom.test('configFile', async function () {
  const port = 9900 + this.index
  const lws = new Lws({
    configFile: 'test/fixture/lws.config.js',
    moduleDir: 'test/fixture'
  })
  const server = lws.createServer()
  server.listen(port)
  lws.useMiddlewareStack()
  const response = await fetch(`http://localhost:${port}/`)
  server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'two')
})

tom.test('create server', async function () {
  const lws = new Lws()
  const port = 9900 + this.index
  const server = lws.createServer()
  server.listen(port)
  server.on('request', (req, res) => {
    res.statusCode = 999
    res.end()
  })
  const response = await fetch(`http://localhost:${port}/`)
  server.close()
  a.strictEqual(response.status, 999)
})

tom.test('createServer, getRequestHandler', async function () {
  const lws = new Lws()
  const port = 9900 + this.index
  const server = lws.createServer()
  server.listen(port)
  server.on('request', lws._getRequestHandler(function (ctx, next) {
    ctx.status = 999
    next()
  }))
  const response = await fetch(`http://localhost:${port}/`)
  server.close()
  a.strictEqual(response.status, 999)
})

tom.test('create HTTPS server, getRequestHandler', async function () {
  const lws = new Lws({ https: true })
  const port = 9900 + this.index
  const server = lws.createServer()
  server.listen(port)
  server.on('request', lws._getRequestHandler(function (ctx, next) {
    ctx.status = 999
    next()
  }))
  const response = await fetch(`https://localhost:${port}/`, { agent })
  server.close()
  a.strictEqual(response.status, 999)
})

tom.test('createServer, use lws-static', async function () {
  const lws = new Lws({
    stack: [ 'lws-static' ],
    directory: 'test/fixture'
  })
  const port = 9900 + this.index
  const server = lws.createServer()
  lws.useMiddlewareStack()
  server.listen(port)
  const response = await fetch(`http://localhost:${port}/one.js`)
  server.close()
  a.strictEqual(response.status, 200)
})

tom.test('createServer, use lws-static 2', async function () {
  const lws = new Lws({
    directory: 'test/fixture',
    moduleDir: '.',
    stack: [ 'lws-static' ]
  })
  const port = 9900 + this.index
  const server = lws.createServer()
  lws.useMiddlewareStack()
  server.listen(port)
  const response = await fetch(`http://localhost:${port}/one.js`)
  server.close()
  a.strictEqual(response.status, 200)
})
