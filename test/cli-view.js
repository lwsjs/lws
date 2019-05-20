const Tom = require('test-runner').Tom
const a = require('assert')
const ViewBase = require('../lib/view/view-base.js')
const CliView = require('../lib/view/cli-view.js')(ViewBase)

const tom = module.exports = new Tom('cli-view')

tom.test('verbose write', async function () {
  const view = new CliView()
  let logMsg = ''
  view.write('test', 'test', {
    verbose: true,
    log: function (msg) { logMsg = msg }
  })
  a.ok(/test:/.test(logMsg))
})

tom.test('koa.error write', async function () {
  const view = new CliView()
  const err = new Error('test error')
  let logMsg = ''
  view.write('koa.error', err, {
    logError: function (msg) { logMsg = msg }
  })
  a.ok(/test error/.test(logMsg))
})
