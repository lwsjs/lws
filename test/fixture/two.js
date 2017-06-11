class Two {
  middleware (options) {
    return (ctx, next) => {
      ctx.body = (ctx.body || '') + 'two'
    }
  }
  optionDefinitions () {
    return [ { name: 'something' }]
  }
}

module.exports = Two
