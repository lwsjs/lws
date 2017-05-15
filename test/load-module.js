'use strict'
const TestRunner = require('test-runner')
const util = require('../lib/util')
const a = require('assert')
const path = require('path')

const runner = new TestRunner()

runner.test('loadModule: unknown path', function () {
  a.throws(
    () => {
      const mod = util.loadModule('./adsfdf')
      console.error(require('util').inspect(mod, { depth: 6, colors: true }))
    },
    err => {
      return err.code === 'MODULE_NOT_FOUND'
    }
  )
})

runner.test('loadModule: unknown path, module-dir', function () {
  a.throws(
    () => {
      const mod = util.loadModule('./adsfdf', {
        'module-dir': '/some/where/wrong'
      })
      console.error(require('util').inspect(mod, { depth: 6, colors: true }))
    },
    err => {
      return err.code === 'MODULE_NOT_FOUND'
    }
  )
})

runner.test('loadModule: absolute path to lib', function () {
  const modulePath = path.resolve(__dirname, '..', 'node_modules/command-line-args/lib/command-line-args.js')
  const module = util.loadModule(modulePath)
  a.strictEqual(module.name, 'commandLineArgs')
})

runner.test('loadModule: full module name', function () {
  const module = util.loadModule('command-line-args')
  a.strictEqual(module.name, 'commandLineArgs')
})

runner.test('loadModule: partial module name (prefix supplied)', function () {
  const module = util.loadModule('line-args', { prefix: 'command-' })
  a.strictEqual(module.name, 'commandLineArgs')
})

runner.test('loadModule: full module name (prefix supplied)', function () {
  const module = util.loadModule('command-line-args', { prefix: 'command-' })
  a.strictEqual(module.name, 'commandLineArgs')
})

runner.test('loadModule: full module name, current dir default', function () {
  const module = util.loadModule('test/fixture/loadModule/some-module')
  a.strictEqual(module.name, 'someModule')
})

runner.test('loadModule: full module name, current dir default, module-dir', function () {
  const module = util.loadModule('test/fixture/loadModule/some-module', {
    'module-dir': '/some/where'
  })
  a.strictEqual(module.name, 'someModule')
})

runner.test('loadModule: full module name, module-dir', function () {
  const module = util.loadModule('some-module', {
    'module-dir': path.resolve('test', 'fixture', 'loadModule')
  })
  a.strictEqual(module.name, 'someModule')
})

runner.test('loadModule: full module name, multiple module-dirs', function () {
  const module = util.loadModule('next-module', {
    'module-dir': [
      path.resolve('test', 'fixture', 'loadModule'),
      path.resolve('test', 'fixture', 'loadModule2')
    ]
  })
  a.strictEqual(module.name, 'nextModule')
})

runner.test('loadModule: partial module name, multiple module-dirs, prefix', function () {
  const module = util.loadModule('module', {
    'module-dir': [
      path.resolve('test', 'fixture', 'loadModule'),
      path.resolve('test', 'fixture', 'loadModule2')
    ],
    prefix: 'next-'
  })
  a.strictEqual(module.name, 'nextModule')
})

runner.test('loadModule: full module name, multiple module-dirs, prefix', function () {
  const module = util.loadModule('next-module', {
    'module-dir': [
      path.resolve('test', 'fixture', 'loadModule'),
      path.resolve('test', 'fixture', 'loadModule2')
    ],
    prefix: 'next-'
  })
  a.strictEqual(module.name, 'nextModule')
})

runner.test('loadModule: partial module name (prefix supplied), module-dir', function () {
  const module = util.loadModule('module', {
    'module-dir': path.resolve('test', 'fixture', 'loadModule'),
    prefix: 'some-'
  })
  a.strictEqual(module.name, 'someModule')
})
