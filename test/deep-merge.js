const Tom = require('test-runner').Tom
const util = require('../lib/util')
const a = require('assert')

const tom = module.exports = new Tom('deepMerge')

tom.test('simple', function () {
  const result = util.deepMerge(
    { port: 8000 },
    { stack: [ 'one' ] },
    { stack: [ 'two' ], help: true }
  )
  a.deepStrictEqual(result, {
    port: 8000,
    stack: [ 'two' ],
    help: true
  })
})

tom.test('arrays: new array does not overwrite if it is empty', function () {
  let result = util.deepMerge(
    { stack: [ 'one' ] },
    { stack: [] }
  )
  a.deepStrictEqual(result, {
    stack: [ 'one' ]
  })
})

tom.test('arrays 2: later array overwrites if it has items', function () {
  let result = util.deepMerge(
    { stack: [] },
    { stack: [ 'one' ] }
  )
  a.deepStrictEqual(result, {
    stack: [ 'one' ]
  })
})

tom.test('arrays 3: later array overwrites if it has items', function () {
  let result = util.deepMerge(
    { stack: [ 'two' ] },
    { stack: [ 'one' ] }
  )
  a.deepStrictEqual(result, {
    stack: [ 'one' ]
  })
})
