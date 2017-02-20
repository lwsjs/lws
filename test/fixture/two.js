class Feature {
  middleware (options) {
    return function (req, res) {
      res.end('two')
    }
  }
}

module.exports = Feature
