class Two {
  middleware (options) {
    return function twoMiddleware (ctx) {
      ctx.body = 'two'
    }
  }
  optionDefinitions () {
    return [ { name: 'something' } ]
  }
}

module.exports = Two
