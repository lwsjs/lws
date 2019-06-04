const EventEmitter = require('events')

class Two extends EventEmitter {
  middleware (options) {
    this.emit('verbose', 'test', 'test')
    return function twoMiddleware (ctx) {
      ctx.body = 'two'
    }
  }
  optionDefinitions () {
    return [ { name: 'something' } ]
  }
}

module.exports = Two
