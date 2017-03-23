exports.optionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Print these usage instructions.',
    group: 'misc'
  },
  {
    name: 'config',
    type: Boolean,
    description: 'Print the active config.',
    group: 'misc'
  },
  {
    name: 'config-file',
    alias: 'c',
    type: String,
    description: 'Config filename to use, defaults to "lws.config.js".',
    group: 'misc',
    typeLabel: '[underline]{file}'
  },
  {
    name: 'verbose',
    type: Boolean,
    alias: 'v',
    description: 'Verbose output.',
    group: 'misc'
  },
  {
    name: 'version',
    type: Boolean,
    description: 'Print the version number.',
    group: 'misc'
  },
  {
    name: 'port',
    alias: 'p',
    type: Number,
    description: 'Web server port.',
    group: 'server'
  },
  {
    name: 'hostname',
    type: String,
    description: 'The hostname (or IP address) to listen on. Defaults to 0.0.0.0.',
    group: 'server'
  },
  {
    name: 'stack',
    type: String,
    multiple: true,
    description: 'Feature stack.',
    group: 'server',
    typeLabel: '[underline]{feature} [underline]{...}'
  },
  {
    name: 'key',
    type: String,
    typeLabel: '[underline]{file}',
    group: 'server',
    description: 'SSL key. Supply along with --cert to launch a https server.'
  },
  {
    name: 'cert',
    type: String,
    typeLabel: '[underline]{file}',
    group: 'server',
    description: 'SSL cert. Supply along with --key to launch a https server.'
  },
  {
    name: 'https',
    type: Boolean,
    group: 'server',
    description: 'Enable HTTPS using a built-in key and cert, registered to the domain 127.0.0.1.'
  }
]

function usage (middlewareDefinitions) {
  let mwSection
  if (middlewareDefinitions.length) {
    mwSection = {
      header: 'Middleware',
      optionList: middlewareDefinitions,
      group: 'middleware'
    }
  } else {
    mwSection = {
      header: 'Middleware',
      content: '[italic]{No middleware specified.}',
      group: 'middleware'
    }
  }
  return [
    {
      header: 'Synopsis',
      content: [
        '$ ws [--verbose] [--config-file [underline]{file}] [<server options>] [<middleware options>]',
        '$ ws --config',
        '$ ws --help',
        '$ ws --version'
      ]
    },
    {
      header: 'General',
      optionList: exports.optionDefinitions,
      group: 'misc'
    },
    {
      header: 'Server',
      optionList: exports.optionDefinitions,
      group: 'server'
    },
    mwSection
  ]
}

exports.usage = usage
