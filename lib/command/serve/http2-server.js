const Server = require('./server')

class Http2Server extends Server {
  static getServer (options) {
    let key = options.key
    let cert = options.cert

    if (!(key && cert)) {
      const path = require('path')
      key = path.resolve(__dirname, 'ssl', '127.0.0.1.key')
      cert = path.resolve(__dirname, 'ssl', '127.0.0.1.crt')
    }

    if (key && cert) {
      const fs = require('fs')
      const serverOptions = {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert)
      }

      const http2 = require('http2')
      const server = http2.createServer(serverOptions)
      server.isHttps = true
      return server
    } else {
      throw new Error('https server requires a key and cert')
    }

    server.on('request', (req, res) => {
      if (req.url === '/') {
        console.error('DOING PUSH')
        doPush2(res, '/lib/dojo/dojo.js', 'src/lib/dojo/dojo.js')
        doPush2(res, '/lib/dijit/dijit.js', 'src/lib/dijit/dijit.js')
        // const FileSet = require('file-set')
        // let fileSet = new FileSet('src/script/**/*.js')
        // for (const file of fileSet.files) {
        //   // console.log(file)
        //   doPush2(res, file.replace('src/', '/'), file)
        // }
        // fileSet = new FileSet('src/lib/dojo/**/*.js')
        // for (const file of fileSet.files) {
        //   // console.log(file)
        //   doPush2(res, file.replace('src/', '/'), file)
        // }
        // fileSet = new FileSet('src/lib/dijit/**/*.js')
        // for (const file of fileSet.files) {
        //   console.log(file)
        //   doPush2(res, file.replace('src/', '/'), file)
        // }
      }
    })

    function doPush (res, url, filename, type = 'application/javascript') {
      const stream = res.push(url, {
        status: 200,
        method: 'GET',
        request: {
          accept: '*/*'
        },
        response: {
          'content-type': type
        }
      })
      stream.on('error', console.error)
      const fs = require('fs')
      // fs.createReadStream('index.js').pipe(process.stderr)
      fs.createReadStream(filename).pipe(stream)
    }

    function doPush2 (res, url, filename, type = 'application/javascript') {
      const push = res.push(url)
      push.writeHead(200, {
        'content-type': type
      })
      const fs = require('fs')
      fs.createReadStream(filename).pipe(push)
    }

    return server
  }
}

module.exports = Http2Server
