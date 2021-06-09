import TestRunner from 'test-runner'
import assert from 'assert'
import { getStoredConfig } from '../lib/util.mjs'
const a = assert.strict

const tom = new TestRunner.Tom()

tom.test('one MSJ file', async function () {
  const result = await getStoredConfig('test/fixture/lws.config.mjs')
  a.deepEqual(result, { stack: [ 'two.mjs' ] })
})

tom.test('one CJS file', async function () {
  const result = await getStoredConfig('test/fixture/lws.config.cjs')
  a.deepEqual(result, { stack: [ 'two.mjs' ] })
})

tom.test('one JS file, CJS content', async function () {
  const result = await getStoredConfig('test/fixture/lws.config.js')
  a.deepEqual(result, { stack: [ 'two.mjs' ] })
})

tom.todo('Support JS file, ESM content')

tom.test('multiple files: first not found, second found', async function () {
  const result = await getStoredConfig(['dfasdfsd', 'test/fixture/lws.config.mjs'])
  a.deepEqual(result, { stack: [ 'two.mjs' ] })
})

export default tom
