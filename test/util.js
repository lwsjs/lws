'use strict'
const TestRunner = require('test-runner')
const util = require('../lib/util')
const a = require('assert')
const request = require('req-then')

const runner = new TestRunner()

runner.test('.parseCommandLineOptions()', function () {
  process.argv = [ 'node', 'example.js', '--help' ]
  const { options, optionDefinitions } = util.parseCommandLineOptions()
  a.strictEqual(options._all.help, true)
})

runner.test('.parseCommandLineOptions(): with extra feature options', function () {
  process.argv = [ 'node', 'script.js', '--one' ]
  try {
    util.parseCommandLineOptions()
    throw new Error("shouldn't reach here")
  } catch (err) {
    a.strictEqual(err.name, 'UNKNOWN_OPTION')
  }

  process.argv = [ 'node', 'script.js', '--one', '--stack', 'test/fixture/feature.js' ]
  const { options, optionDefinitions } = util.parseCommandLineOptions()
  a.strictEqual(options._all.one, true)
})

runner.test('.parseCommandLineOptions(): with passed in definitions', function () {
  process.argv = [ 'node', 'script.js', '--one', '--stack', 'test/fixture/feature.js', '--two', 'two' ]
  try {
    const { options, optionDefinitions } = util.parseCommandLineOptions()
  } catch (err) {
    a.strictEqual(err.name, 'UNKNOWN_OPTION')
  }
  try {
    /* defining --two via constructor options is overridden */
    const { options, optionDefinitions } = util.parseCommandLineOptions([ { name: 'two' } ])
  } catch (err) {
    a.strictEqual(err.name, 'UNKNOWN_OPTION')
  }

  process.argv = [ 'node', 'script.js', '--one', '--stack', 'test/fixture/feature.js' ]
  const { options, optionDefinitions } = util.parseCommandLineOptions([ { name: 'two' } ])
  a.strictEqual(options._all.one, true)
})

runner.test('deepMerge', function () {
  const result = util.deepMerge(
    { port: 8000 },
    { stack: [ 'one' ] },
    { stack: [ 'two' ], help: true }
  )
  a.deepStrictEqual(result, {
    port: 8000,
    stack: [ 'two' ],
    help: true
  })
})

runner.test('deepMerge: arrays', function () {
  debugger
  let result = util.deepMerge(
    { stack: [ 'one' ] },
    { stack: [] }
  )
  a.deepStrictEqual(result, {
    stack: [ 'one' ]
  })
})

runner.test('deepMerge: arrays 2', function () {
  let result = util.deepMerge(
    { stack: [] },
    { stack: [ 'one' ] }
  )
  a.deepStrictEqual(result, {
    stack: [ 'one' ]
  })
})

runner.test('deepMerge: arrays 3', function () {
  let result = util.deepMerge(
    { stack: [ 'two' ] },
    { stack: [ 'one' ] }
  )
  a.deepStrictEqual(result, {
    stack: [ 'one' ]
  })
})
