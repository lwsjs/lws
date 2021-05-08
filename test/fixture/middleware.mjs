import EventEmitter from 'events'

class Two extends EventEmitter {
  middleware (options) {
    this.emit('verbose', 'test', 'test')
    return function twoMiddleware (ctx) {
      ctx.body = 'two'
    }
  }

  optionDefinitions () {
    return [{ name: 'something' }]
  }
}

export default Two
