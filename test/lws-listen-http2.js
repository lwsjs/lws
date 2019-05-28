const Tom = require('test-runner').Tom
const Lws = require('../')
const a = require('assert')
const http2 = require('http2')

const tom = module.exports = new Tom('http2')

tom.test('--http2', async function () {
  const port = 9300 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = new Lws()
  const server = lws.listen({
    stack: [ One ],
    http2: true,
    port: port
  })

  const response = await fetchHttp2(`https://localhost:${port}`, '/')
  server.close()
  a.strictEqual(response.headers[':status'], 200)
  a.strictEqual(response.body, 'one')
})

async function fetchHttp2 (host, path) {
  return new Promise((resolve, reject) => {
    const client = http2.connect(host, {
      rejectUnauthorized: false
    })
    client.on('error', reject)

    const req = client.request({ ':path': path })

    let headers = {}
    req.on('response', (hdrs, flags) => {
      headers = hdrs
    })

    req.setEncoding('utf8')
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      client.close()
      resolve({ headers, body })
    })
    req.end()
  })
}
