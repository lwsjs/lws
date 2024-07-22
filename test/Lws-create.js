import assert from 'assert'
import Lws from 'lws'
import fetch from 'node-fetch'

const a = assert.strict
const test = new Map()

test.set('one middleware', async function () {
  const port = 9401
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = await Lws.create({
    stack: [One],
    port
  })
  try {
    const response = await fetch(`http://127.0.0.1:${port}`)
    a.equal(response.status, 200)
    const body = await response.text()
    a.equal(body, 'one')
  } finally {
    lws.server.close()
  }
})

export { test }
