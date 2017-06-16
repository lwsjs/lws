module.exports = ServerFactory => class HttpsServerFactory extends ServerFactory {
  create (options) {
    const fs = require('fs')
    const https = require('https')
    if (options.pfx) {
      options.pfx = fs.readFileSync(options.pfx)
    } else {
      if (!(options.key && options.cert)) {
        options.key = this.getDefaultKeyPath()
        options.cert = this.getDefaultCertPath()
      }
      options.key = fs.readFileSync(options.key)
      options.cert = fs.readFileSync(options.cert)
    }
    return https.createServer(options)
  }
}
