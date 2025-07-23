import Config from '../lib/config.js'
import { strict as a } from 'assert'

const [test, only, skip] = [new Map(), new Map(), new Map()]

test.set('command line args', async function () {
  const config = new Config()
  const optionsSet = await config.getServerOptions(['--help'])
  this.data = optionsSet
})

test.set('command line args 2', async function () {
  const config = new Config()
  const optionsSet = await config.getServerOptions(['-h'])
  this.data = optionsSet
})

export { test, only, skip }
