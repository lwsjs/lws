import LwsCli from 'lws/lib/cli-app.mjs'
import fetch from 'node-fetch'
import assert from 'assert'
const a = assert.strict

const test = new Map()

test.set('no middleware', async function () {
  const port = 9301
  const cli = new LwsCli({
    logError: console.error
  })
  const server = await cli.start(['--port', `${port}`])
  if (process.exitCode) {
    server.close()
    throw new Error('CLI failed - check log')
  }
  try {
    const response = await fetch(`http://127.0.0.1:${port}/`)
    a.equal(response.status, 404)
  } finally {
    server.close()
  }
})

test.set('one middleware', async function () {
  const port = 9302
  const cli = new LwsCli({ logError: console.error })
  const server = await cli.start(['--port', `${port}`, '--stack', 'test/fixture/one.js'])
  if (process.exitCode) {
    server.close()
    throw new Error('CLI failed - check log')
  }
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.equal(body, 'one')
})

test.set('two middlewares', async function () {
  const port = 9303
  const cli = new LwsCli({ logError: console.error })
  const argv = ['--port', `${port}`, '--stack', 'test/fixture/one.js', 'test/fixture/two.js']
  const server = await cli.start(argv)
  if (process.exitCode) {
    server.close()
    throw new Error('CLI failed - check log')
  }
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.equal(body, 'onetwo')
})

test.set('one middleware with cli option', async function () {
  const port = 9304
  const cli = new LwsCli({ logError: console.error })
  const argv = ['--port', `${port}`, '--stack', 'test/fixture/one.js', '--something', 'yeah']
  const server = await cli.start(argv)
  if (process.exitCode) {
    server.close()
    throw new Error('CLI failed - check log')
  }
  const response = await fetch(`http://localhost:${port}`)
  server.close()
  const body = await response.text()
  a.equal(body, 'yeah')
})

export { test }
