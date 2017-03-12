'use strict'
const TestRunner = require('test-runner')
const Lws = require('../')
const a = require('assert')
const request = require('req-then')

const runner = new TestRunner({ sequential: true })

runner.test('one feature', async function () {
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
  lws.listen()
  const response = await request(`http://localhost:${port}`)
  a.strictEqual(response.data.toString(), 'one')
  lws.server.close()
})

runner.test('one feature and feature path', async function () {
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
  lws.listen()
  const response = await request(`http://localhost:${port}`)
  a.strictEqual(response.data.toString(), 'onetwo')
  lws.server.close()
})

runner.test('Two features', async function () {
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
  lws.listen()
  const response = await request(`http://localhost:${port}`)
  a.strictEqual(response.data.toString(), 'onetwo')
  lws.server.close()
})

runner.test('.parseCommandLineOptions()', function () {
  const lws = new Lws({ version: true })

  process.argv = [ 'node', 'example.js', '--help' ]
  a.strictEqual(lws.options.version, true)
  a.strictEqual(lws.options.help, undefined)
  lws.parseCommandLineOptions()
  a.strictEqual(lws.options.help, true)
})

runner.test('.parseCommandLineOptions(): with extra feature options', function () {
  process.argv = [ 'node', 'script.js', '--one' ]
  const lws = new Lws()
  try {
    lws.parseCommandLineOptions()
    throw new Error("shouldn't reach here")
  } catch (err) {
    a.strictEqual(err.name, 'UNKNOWN_OPTION')
    a.strictEqual(lws.options.one, undefined)
  }

  process.argv = [ 'node', 'script.js', '--one', '--stack', 'test/fixture/feature.js' ]
  lws.parseCommandLineOptions()
  a.strictEqual(lws.options.one, true)
})
