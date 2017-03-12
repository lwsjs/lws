class Feature {
  middleware (options) {
    return (ctx, next) => {
      ctx.body += 'two'
    }
  }
}

module.exports = Feature
