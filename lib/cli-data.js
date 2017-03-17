exports.optionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Print these usage instructions.',
    group: 'misc'
  },
  {
    name: 'view',
    type: String,
    description: 'Custom view',
    group: 'misc'
  },
  {
    name: 'config',
    type: Boolean,
    description: 'Print the stored config.',
    group: 'misc'
  },
  {
    name: 'config-file',
    alias: 'c',
    type: String,
    description: 'Config file to use, defaults to `.${config-name}.json`. Note: storing this option in config has no effect.',
    group: 'misc'
  },
  {
    name: 'config-name',
    type: String,
    description: 'Property name to search for config within package.json. Defaults to "lws"',
    group: 'misc'
  },
  {
    name: 'verbose',
    type: Boolean,
    alias: 'v',
    description: 'Verbose output.',
    group: 'misc'
  },
  {
    name: 'debug',
    type: Boolean,
    description: 'Very verbose output, intended for debugging.',
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
    name: 'stack',
    type: String,
    multiple: true,
    description: 'Feature stack.',
    group: 'server'
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
  return [
    {
      header: 'local-web-server',
      content: 'A simple web-server for productive front-end development.'
    },
    {
      header: 'Synopsis',
      content: [
        '$ ws [--verbose] [<server options>] [<middleware options>]',
        '$ ws --config',
        '$ ws --help'
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
    {
      header: 'Middleware',
      optionList: middlewareDefinitions,
      group: 'middleware'
    },
    {
      content: 'Project home: [underline]{https://github.com/75lb/local-web-server}'
    }
  ]
}

exports.usage = usage
