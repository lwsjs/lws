class Two {
  middleware (options) {
    return function two (ctx, next) {
      ctx.body = (ctx.body || '') + 'two'
      next()
    }
  }
}

export default Two
