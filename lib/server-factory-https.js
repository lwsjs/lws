module.exports = ServerFactory => class HttpsServerFactory extends ServerFactory {
  create (options) {
    let key = options.key
    let cert = options.cert

    if (!(key && cert)) {
      key = this.getDefaultKey()
      cert = this.getDefaultCert()
    }

    if (key && cert) {
      const fs = require('fs')
      const serverOptions = {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert)
      }

      const https = require('https')
      return https.createServer(serverOptions)
    } else {
      throw new Error('https server requires a key and cert')
    }
  }
}
