const Tom = require('test-runner').Tom
const Lws = require('../')
const a = require('assert')
const http2 = require('http2')

const tom = module.exports = new Tom('http2')

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
  const lws = Lws.create({
    stack: [One],
    http2: true,
    port: port
  })

  const response = await fetchHttp2(`https://localhost:${port}`, '/')
  lws.server.close()
  a.strictEqual(response.headers[':status'], 200)
  a.strictEqual(response.body, 'one')
})

tom.test('--http2 --key and --cert', async function () {
  const port = 9300 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = Lws.create({
    stack: [One],
    key: 'ssl/private-key.pem',
    cert: 'ssl/lws-cert.pem',
    port: port,
    http2: true
  })
  const response = await fetchHttp2(`https://localhost:${port}`, '/')
  lws.server.close()
  a.strictEqual(response.headers[':status'], 200)
  a.strictEqual(response.body, 'one')
})

tom.test('--http2 --pfx', async function () {
  const port = 9300 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = Lws.create({
    stack: [One],
    pfx: 'ssl/lws.pfx',
    port: port,
    http2: true
  })
  const response = await fetchHttp2(`https://localhost:${port}`, '/')
  lws.server.close()
  a.strictEqual(response.headers[':status'], 200)
  a.strictEqual(response.body, 'one')
})

tom.test('--http2 --pfx, --max-connections', async function () {
  const port = 9300 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  a.throws(
    () => {
      Lws.create({
        stack: [One],
        pfx: 'ssl/lws.pfx',
        port: port,
        maxConnections: 11,
        http2: true
      })
    },
    /no effect with http2/
  )
})

tom.test('--http2 --pfx, --keep-alive-timeout', async function () {
  const port = 9300 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  a.throws(
    () => {
      Lws.create({
        stack: [One],
        pfx: 'ssl/lws.pfx',
        port: port,
        keepAliveTimeout: 10001,
        http2: true
      })
    },
    /no effect with http2/
  )
})
