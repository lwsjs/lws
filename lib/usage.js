const UsageStats = require('usage-stats')
const os = require('os')
const t = require('typical')

const usage = new UsageStats('UA-70853320-8', {
  an: 'lws',
  av: require('../package').version
})
usage.defaults
  .set('cd1', process.version)
  .set('cd2', os.type())
  .set('cd3', os.release())
  .set('cd4', 'api')

usage.screen = function (name, options) {
  this.screenView(name)
  for (const prop in options) {
    this.event('option', prop)
  }
  if (options.stack) {
    for (const mw of options.stack) {
      this.event('stack', t.isObject(mw) ? mw.constructor.name : mw)
    }
  }
  return this.send().catch(err => { /* disregard errors */ })
  // return this.debug().then(response => console.error(require('util').inspect(response, { depth: 6, colors: true })))
}

module.exports = usage
