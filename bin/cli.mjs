#!/usr/bin/env node
const nodeVersionMatches = require('node-version-matches')

if (nodeVersionMatches('>=10')) {
  const LwsCli = require('../lib/cli-app')
  const cli = new LwsCli()
  cli.start()
} else {
  console.log('Sorry, this app requires node v10 or above. Please upgrade https://nodejs.org/en/')
}
