import express from 'express'
import serveIndex from 'serve-index'
import path from 'node:path'

class StaticFileServerApp {
  requestHandler (options = {}) {
    const rootPath = './'
    const app = express()
    app.use(express.static(rootPath, {}))
    app.use(serveIndex(rootPath, { icons: true }))
    if (options['static.404']) {
      app.use((req, res) => {
        res.sendFile(path.resolve(options['static.404']), { maxAge: 60 * 60 * 1000 })
      })
    }
    return app
  }
}

export default StaticFileServerApp
