'use strict'
const TestRunner = require('test-runner')
const Lws = require('../')
const a = require('assert')
const request = require('req-then')

const runner = new TestRunner()

runner.test('stack: one feature', async function () {
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
  a.strictEqual(response.data.toString(), 'one')
  lws.server.close()
})

runner.test('stack: one feature, one feature path', async function () {
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
  a.strictEqual(response.data.toString(), 'onetwo')
  lws.server.close()
})

runner.test('stack: one feature, one cli feature path', async function () {
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
    stack: [ Feature ],
    port: port
  })
  process.argv = [ 'node', 'example.js', '--stack', 'test/fixture/two.js' ]
  lws.start()
  process.argv = [ 'node', 'example.js' ]
  const response = await request(`http://localhost:${port}`)
  lws.server.close()
  a.strictEqual(response.data.toString(), 'onetwo')
})

runner.test('stack: Two features', async function () {
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
})

runner.skip('--help', function () {
  const lws = new Lws()
  process.argv = [ 'node', 'script.js', '--help' ]
  // need to be able to pass in the output stream in order to test it
})
