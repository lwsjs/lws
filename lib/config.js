import path from 'node:path'

class Config {
  constructor (options = {}) {
    this.argv = options.argv || process.argv.slice(2)
    this.defaultOptions = {
      port: 8000
    }
  }

  async cli () {
    if (this.argv.length === 0) {
      return {}
    }

    function singleValue (valueIndex, arg) {
      return valueIndex === 1 && !arg.startsWith('--')
    }

    const CommandLineArgs = (await import('command-line-args')).default
    const commandLineArgs = new CommandLineArgs(this.argv, [
      {
        name: 'port',
        from: arg => arg === '--port',
        to: singleValue,
        type: values => values[0] !== undefined ? Number(values[0]) : undefined
      },
      {
        name: 'https',
        from: arg => arg === '--https',
        type: () => true
      },
      {
        name: 'http2',
        from: arg => arg === '--http2',
        type: () => true
      },
      {
        name: 'showConfig',
        from: arg => arg === '--show-config',
        type: () => true
      },
      {
        name: 'config',
        from: arg => arg === '--config',
        to: singleValue,
        type: values => values[0]
      },
      {
        name: 'log-format',
        from: arg => arg === '--log-format',
        to: singleValue,
        type: values => values[0]
      },
      {
        name: 'app',
        from: arg => arg === '--app',
        to: singleValue,
        type: values => values[0]?.length && path.resolve(values[0])
      },
      {
        from: arg => /--(\S)+\.(\S)+\.(\S)+/.test(arg),
        def: fromArg => {
          const [group, name, type] = fromArg.substr(2).split('.')
          const dynamicDef = {
            name: extraction => `${group}.${name}`
          }
          if (type === 'number') {
            dynamicDef.to = singleValue
            dynamicDef.type = values => Number(values[0])
          } else if (type === 'string') {
            dynamicDef.to = singleValue
            dynamicDef.type = values => values[0]
          } else if (type === 'string[]') {
            dynamicDef.to = (valueIndex, arg, index, argv) => argv[index + 1] === undefined || argv[index + 1].startsWith('--')
          } else if (type === 'flag') {
            dynamicDef.type = values => true
          } else {
            throw new Error(`Invalid option type: ${type}`)
          }
          return dynamicDef
        }
      }
    ])

    commandLineArgs.buildOutput = function (matches) {
      const output = {}
      for (const [name, values] of matches) {
        if (/\./.test(name)) {
          const [subgroup, subname] = name.split('.')
          output[subgroup] = { [subname]: values }
        } else {
          output[name] = values
        }
      }
      return output
    }

    const cliOptions = commandLineArgs.parse()
    return cliOptions
  }

  async stored () {
    let lwsConfig = {}
    try {
      lwsConfig = (await import(path.resolve('lws.config.js'))).default
    } catch (err) {
      if (err.code !== 'ERR_MODULE_NOT_FOUND') {
        throw err
      }
    }
    try {
      lwsConfig = (await import(path.resolve('lws.config.mjs'))).default
    } catch (err) {
      if (err.code !== 'ERR_MODULE_NOT_FOUND') {
        throw err
      }
    }
    return lwsConfig
  }

  async combine () {
    const stored = await this.stored()
    const cli = await this.cli()
    return Object.assign(this.defaultOptions, stored, cli)
  }
}

export default Config
