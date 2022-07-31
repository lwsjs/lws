import TestRunner from 'test-runner'
import assert from 'assert'
import { getIPList, getStoredConfig } from '../../lib/util.js'

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

tom.test('one MSJ file', async function () {
  const result = await getStoredConfig('test/fixture/lws.config.mjs')
  a.deepEqual(result, { stack: ['two.js'] })
})

tom.test('one CJS file', async function () {
  const result = await getStoredConfig('test/fixture/lws.config.cjs')
  a.deepEqual(result, { stack: ['two.js'] })
})

tom.test('one JS file, CJS content', async function () {
  const result = await getStoredConfig('test/fixture/lws.config.js')
  a.deepEqual(result, { stack: ['two.js'] })
})

tom.todo('Support JS file, ESM content')

tom.test('multiple files: first not found, second found', async function () {
  const result = await getStoredConfig(['dfasdfsd', 'test/fixture/lws.config.mjs'])
  a.deepEqual(result, { stack: ['two.js'] })
})

export default tom
