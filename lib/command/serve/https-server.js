const Server = require('./server')

class HttpsServer extends Server {
  /**
   * Returns a listening server which processes requests using the middleware supplied.
   * @returns {Server}
   * @ignore
   */
  static getServer (options) {
    let key = options.key
    let cert = options.cert

    if (!key && cert) {
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

      const https = options.http2 ? require('http2') : require('https')
      return https.createServer(serverOptions)
    } else {
      throw new Error('https server requires a key and cert')
    }
  }
}

module.exports = HttpsServer
