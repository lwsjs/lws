import assert from 'assert'
import { getIPList, getStoredConfig } from '../../lib/util.js'

const a = assert.strict
const test = new Map()
const skip = new Map()

test.set('getIPList', async function () {
  const result = getIPList()
  a.ok(result.length > 1)
  a.ok(result.every(i => i.name && i.address))
})

test.set('getIPList(boundHostname)', async function () {
  const result = getIPList('test')
  a.equal(result.length, 1)
  a.equal(result[0].name, 'hostname')
  a.ok(result.every(i => i.name && i.address))
})

test.set('one MJS file', async function () {
  const result = await getStoredConfig('test/fixture/lws.config.mjs')
  a.deepEqual(result, { stack: ['two.js'] })
})

test.set('one CJS file', async function () {
  const result = await getStoredConfig('test/fixture/lws.config.cjs')
  a.deepEqual(result, { stack: ['two.js'] })
})

test.set('one JS file, CJS content', async function () {
  const result = await getStoredConfig('test/fixture/lws.config.js')
  a.deepEqual(result, { stack: ['two.js'] })
})

skip.set('Support JS file, ESM content')

test.set('multiple files: first not found, second found', async function () {
  const result = await getStoredConfig(['dfasdfsd', 'test/fixture/lws.config.mjs'])
  a.deepEqual(result, { stack: ['two.js'] })
})

export { test, skip }
