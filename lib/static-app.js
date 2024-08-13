import express from 'express'
import serveIndex from 'serve-index'
import path from 'node:path'
import morgan from 'morgan'

class StaticFileServerApp {
  requestHandler (options = {}) {
    const rootPath = options?.static?.root || './'
    const app = express()
    /* logging */
    if (options?.morgan?.format) {
      app.use(morgan(options?.morgan?.format, options.morgan))
    }
    /* static files */
    app.use(express.static(rootPath, {}))

    /* File system Index */
    app.use(serveIndex(rootPath, { icons: true }))

    /* Custom 404 */
    if (options['static.404']) {
      app.use((req, res) => {
        res.sendFile(path.resolve(options['static.404']))
      })
    }

    /* SPA - can it be used alongside Custom 404? */
    if (options.spa) {
      app.use((req, res) => {
        res.sendFile(path.resolve(options.spa))
      })
    }
    return app
  }
}

export default StaticFileServerApp
