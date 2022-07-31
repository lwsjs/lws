class One {
  middleware (options = {}) {
    return function one (ctx, next) {
      ctx.body = options.something || 'one'
      next()
    }
  }

  optionDefinitions () {
    return [{ name: 'something' }]
  }
}

export default One
