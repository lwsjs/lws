import TestRunner from 'test-runner'
import assert from 'assert'
import * as util from '../lib/util.mjs'
import MiddlewareStack from '../lib/middleware-stack.mjs'
import EventEmitter from 'events'
const a = assert.strict

const tom = new TestRunner.Tom()

tom.test('simple', function () {
  const result = util.deepMerge(
    { port: 8000 },
    { stack: ['one'] },
    { stack: ['two'], help: true }
  )
  a.deepEqual(result, {
    port: 8000,
    stack: ['two'],
    help: true
  })
})

tom.test('arrays: new array does not overwrite if it is empty', function () {
  const stack = ['one']
  const result = util.deepMerge(
    { stack },
    { stack: [] }
  )
  a.deepEqual(result, {
    stack: ['one']
  })
  a.equal(result.stack, stack)
})

tom.test('arrays 2: later array overwrites if it has items', function () {
  const result = util.deepMerge(
    { stack: [] },
    { stack: ['one'] }
  )
  a.deepEqual(result, {
    stack: ['one']
  })
})

tom.test('arrays 3: later array overwrites if it has items', function () {
  const result = util.deepMerge(
    { stack: ['two'] },
    { stack: ['one'] }
  )
  a.deepEqual(result, {
    stack: ['one']
  })
})

tom.test('stack: new instance not created', function () {
  class One extends EventEmitter {
    middleware () {
      this.emit('verbose', 'something.test', 1)
    }
  }
  const stack = MiddlewareStack.from([One])
  const result = util.deepMerge(
    { stack },
    { stack: [] }
  )
  a.equal(result.stack, stack)
})

export default tom
