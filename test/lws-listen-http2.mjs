import TestRunner from 'test-runner'
import assert from 'assert'
import Lws from 'lws'
import http2 from 'http2'

const a = assert.strict
const tom = new TestRunner.Tom()

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
  const port = 9350 + this.index
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
    http2: true,
    port: port
  })

  try {
    const response = await fetchHttp2(`https://localhost:${port}`, '/')
    a.equal(response.headers[':status'], 200)
    a.equal(response.body, 'one')
  } finally {
    lws.server.close()
  }
})

tom.test('--http2 --key and --cert', async function () {
  const port = 9350 + this.index
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
    key: 'ssl/private-key.pem',
    cert: 'ssl/lws-cert.pem',
    port: port,
    http2: true
  })
  try {
    const response = await fetchHttp2(`https://localhost:${port}`, '/')
    a.equal(response.headers[':status'], 200)
    a.equal(response.body, 'one')
  } finally {
    lws.server.close()
  }
})

tom.test('--http2 --pfx', async function () {
  const port = 9350 + this.index
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
    pfx: 'ssl/lws.pfx',
    port: port,
    http2: true
  })
  try {
    const response = await fetchHttp2(`https://localhost:${port}`, '/')
    a.equal(response.headers[':status'], 200)
    a.equal(response.body, 'one')
  } finally {
    lws.server.close()
  }
})

tom.test('--http2 --pfx, --max-connections', async function () {
  const port = 9350 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  await a.rejects(
    () => {
      return Lws.create({
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
  const port = 9350 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  await a.rejects(
    () => {
      return Lws.create({
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

export default tom
