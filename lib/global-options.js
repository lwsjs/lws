module.exports = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Print these usage instructions.'
  },
  {
    name: 'config',
    type: Boolean,
    description: 'Print the active config.'
  },
  {
    name: 'config-file',
    alias: 'c',
    type: String,
    description: 'Config filename to use, defaults to "lws.config.js".',
    typeLabel: '[underline]{file}',
    defaultValue: 'lws.config.js'
  },
  {
    name: 'verbose',
    type: Boolean,
    alias: 'v',
    description: 'Verbose output.'
  }
]
