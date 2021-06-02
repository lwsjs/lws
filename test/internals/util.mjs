import TestRunner from 'test-runner'
import assert from 'assert'
import { getIPList } from '../../lib/util.mjs'

const a = assert.strict
const tom = new TestRunner.Tom()

tom.test('getIPList', async function () {
  const result = getIPList()
  a.ok(result.length > 1)
  a.ok(result.every(i => i.name && i.address))
})

tom.test('getIPList(boundHostname)', async function () {
  const result = getIPList('test')
  a.equal(result.length, 1)
  a.equal(result[0].name, 'hostname')
  a.ok(result.every(i => i.name && i.address))
})

export default tom
