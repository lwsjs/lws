'use strict'
const TestRunner = require('test-runner')
const Lws = require('../')
const a = require('assert')
const request = require('req-then')

const runner = new TestRunner()

runner.test('stack at constructor: one feature', async function () {
  const port = 9000 + this.index
  class Feature {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
      }
    }
  }
  const lws = new Lws({
    stack: Feature,
    port: port
  })
  lws.start()
  const response = await request(`http://localhost:${port}`)
  lws.server.close()
  a.strictEqual(response.data.toString(), 'one')
  a.strictEqual(lws.options.stack.length, 1)
})

runner.test('stack at constructor: Two features', async function () {
  const port = 9000 + this.index
  class Feature {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  class Feature2 {
    middleware (options) {
      return (ctx, next) => {
        ctx.body += 'two'
        next()
      }
    }
  }
  const lws = new Lws({
    stack: [ Feature, Feature2 ],
    port: port
  })
  lws.start()
  const response = await request(`http://localhost:${port}`)
  lws.server.close()
  a.strictEqual(response.data.toString(), 'onetwo')
  a.strictEqual(lws.options.stack.length, 2)
})

runner.test('stack at constructor: one feature, one path', async function () {
  const port = 9000 + this.index
  class Feature {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = new Lws({
    stack: [ Feature, 'test/fixture/two.js' ],
    port: port
  })
  lws.start()
  const response = await request(`http://localhost:${port}`)
  lws.server.close()
  a.strictEqual(response.data.toString(), 'onetwo')
  a.strictEqual(lws.options.stack.length, 2)
})

runner.test('stack at constructor and argv: one feature, one path', async function () {
  const port = 9000 + this.index
  class Feature {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
    optionDefinitions () {
      return [ { name: 'something' }]
    }
  }
  const lws = new Lws({
    stack: [ Feature ],
    port: port
  })
  process.argv = [ 'node', 'example.js', '--stack', 'test/fixture/two.js' ]
  lws.start()
  process.argv = [ 'node', 'example.js' ] // reset as process.argv is global
  const response = await request(`http://localhost:${port}`)
  lws.server.close()
  a.strictEqual(lws.options.stack.length, 1)
  a.strictEqual(response.data.toString(), 'two')
})
