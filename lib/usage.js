const UsageStats = require('usage-stats')
const os = require('os')

const usage = new UsageStats('UA-70853320-8', {
  an: 'lws',
  av: require('../package').version
})
usage.defaults
  .set('cd1', process.version)
  .set('cd2', os.type())
  .set('cd3', os.release())
  .set('cd4', 'api')

module.exports = usage
