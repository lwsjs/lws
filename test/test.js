'use strict'
const TestRunner = require('test-runner')
const Lws = require('../')
const a = require('assert')
const request = require('req-then')
const express = require('express')

const runner = new TestRunner({ sequential: true })

runner.test('basic feature', function () {
  class Feature {
   middleware (options) {
     return function (req, res) {
       res.end('one')
     }
   }
  }
  const lws = new Lws({
   stack: Feature,
   port: 9000
  })
  lws.listen()
  return request('http://localhost:9000')
   .then(response => {
     a.strictEqual(response.data.toString(), 'one')
     lws.server.close()
   })
})

runner.test('basic feature and feature path', function () {
  class Feature {
   middleware (options) {
     return function (req, res) {
       res.write('one')
     }
   }
  }
  const lws = new Lws({
   stack: [ Feature, 'test/fixture/two.js' ],
   port: 9000
  })
  lws.listen()
  return request('http://localhost:9000').then(response => {
   a.strictEqual(response.data.toString(), 'onetwo')
   lws.server.close()
  })
})

runner.test('Express feature', function () {
  class Feature {
   middleware (options) {
     const app = express()
     app.use((req, res, next) => {
       res.send('one')
     })
     return app
   }
  }
  const lws = new Lws({
   stack: Feature,
   port: 9000
  })
  lws.listen()
  return request('http://localhost:9000').then(response => {
   a.strictEqual(response.data.toString(), 'one')
   lws.server.close()
  })
})

runner.test('Two express features', function () {
  class Feature {
    middleware (options) {
      const app = express()
      app.use((req, res, next) => {
        req.data = 'one'
        next()
      })
      return app
    }
  }
  class Feature2 {
    middleware (options) {
      const app = express()
      app.use((req, res, next) => {
        res.send(`${req.data}two`)
        next()
      })
      return app
    }
  }
  const lws = new Lws({
    stack: [ Feature, Feature2 ],
    port: 9000
  })
  lws.listen()
  return request('http://localhost:9000')
    .then(response => {
      a.strictEqual(response.data.toString(), 'onetwo')
      lws.server.close()
    })
    .catch(err => {
      lws.server.close()
      throw err
    })
})

runner.skip('.parseCommandLineOptions()', function () {
  const lws = new Lws({ version: true })

  process.argv = [ 'node', 'script.js', '--help' ]
  a.strictEqual(lws.options.version, true)
  a.strictEqual(lws.options.help, undefined)
  lws.parseCommandLineOptions()
  a.strictEqual(lws.options.help, true)
})

runner.skip('.parseCommandLineOptions(): with extra feature options', function () {
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
