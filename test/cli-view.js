const Tom = require('test-runner').Tom
const a = require('assert')
const CliView = require('../lib/view/cli-view.js')

const tom = module.exports = new Tom('cli-view')

tom.test('verbose write', async function () {
  let logMsg = ''
  const view = new CliView({ log: function (msg) { logMsg = msg } })
  view.write('test', 'test', {
    verbose: true
  })
  a.ok(/test:/.test(logMsg))
})

tom.test('middleware.error write', async function () {
  let logMsg = ''
  const view = new CliView({ logError: function (msg) { logMsg = msg } })
  const err = new Error('test error')
  view.write('middleware.error', err)
  a.ok(/test error/.test(logMsg))
})
