'use strict'
const TestRunner = require('test-runner')
const Lws = require('../')
const a = require('assert')
const request = require('req-then')

const runner = new TestRunner()

runner.skip('--help', function () {
  const lws = new Lws()
  process.argv = [ 'node', 'script.js', '--help' ]
  // need to be able to pass in the output stream in order to test it
})

runner.test('general option precedence', function () {

})
