const Tom = require('test-runner').Tom
const a = require('assert')
const Lws = require('../index')

const tom = module.exports = new Tom('lws-create-server')

tom.test('invalid options 1', function () {
  const lws = new Lws()
  a.throws(
    () => lws.createServer({ cert: 'something' }),
    /--key and --cert must always be supplied together/
  )
})

tom.test('invalid options 2', function () {
  const lws = new Lws()
  a.throws(
    () => lws.createServer({ key: 'something' }),
    /--key and --cert must always be supplied together/
  )
})

tom.test('invalid options 3', function () {
  const lws = new Lws()
  a.throws(
    () => lws.createServer({ https: true, pfx: 'something' }),
    /use one of --https or --pfx, not both/
  )
})
