const Tom = require('test-runner').Tom
const a = require('assert').strict
const util = require('../../lib/util')

const tom = module.exports = new Tom()

tom.test('getIPList', async function () {
  const result = util.getIPList()
  a.ok(result.length > 1)
  a.ok(result.every(i => i.name && i.address))
})

tom.test('getIPList(boundHostname)', async function () {
  const result = util.getIPList('test')
  a.equal(result.length, 1)
  a.equal(result[0].name, 'hostname')
  a.ok(result.every(i => i.name && i.address))
})
