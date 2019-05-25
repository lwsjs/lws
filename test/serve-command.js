const Tom = require('test-runner').Tom
const LwsCli = require('../lib/cli-app')
const a = require('assert')
const fetch = require('node-fetch')

const tom = module.exports = new Tom('cli 2')

tom.test('stack initialOptions: one middleware', async function () {
  const port = 9300 + this.index
  const One = Base => class extends Base {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
      }
    }
  }
  const cli = new LwsCli({ logError: function () {} })
  const server = cli.start({
    stack: One,
    port: port
  }, [])
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.strictEqual(body, 'one')
})

tom.test('stack initialOptions: Two middlewares', async function () {
  const port = 9300 + this.index
  const One = Base => class extends Base {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const Two = Base => class extends Base {
    middleware (options) {
      return (ctx, next) => {
        ctx.body += 'two'
        next()
      }
    }
  }
  const cli = new LwsCli()
  const server = cli.start({
    stack: [ One, Two ],
    port: port,
    logError: function () {}
  }, [])
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.strictEqual(body, 'onetwo')
})

tom.test('stack initialOptions: one middleware, one path', async function () {
  const port = 9300 + this.index
  const One = Base => class extends Base {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const cli = new LwsCli()
  const server = cli.start({
    stack: [ One, './test/fixture/two.js' ],
    port: port,
    logError: function () {}
  }, [])
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.strictEqual(body, 'onetwo')
})

tom.test('stack initialOptions and argv: command-line Stack takes precedence', async function () {
  const port = 9300 + this.index
  const One = Base => class extends Base {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const cli = new LwsCli()
  let server = cli.start({
    stack: [ One ], // One will be overridden by command-line choice of Two
    port: port,
    logError: function () {}
  }, [ '--stack', './test/fixture/two.js' ])
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.strictEqual(body, 'two')
})

tom.test('stack initialOptions and argv: one middleware with cli option', async function () {
  const port = 9300 + this.index
  const One = Base => class extends Base {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = options.something
        next()
      }
    }
    optionDefinitions () {
      return [ { name: 'something' } ]
    }
  }
  const cli = new LwsCli()
  let server = cli.start({
    stack: [ One ],
    port: port,
    logError: function () {}
  }, [ '--something', 'yeah' ])
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.strictEqual(body, 'yeah')
})
