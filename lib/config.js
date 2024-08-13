import path from 'node:path'
import CommandLineArgs from 'command-line-args'

class CommandLineArgsDeepOutput extends CommandLineArgs {
  buildOutput (matches) {
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
}

function toSingleValue (valueIndex, arg) {
  return valueIndex === 1 && !arg.startsWith('--')
}

function toLastItem (valueIndex, arg, index, argv) {
  return argv[index + 1] === undefined || argv[index + 1].startsWith('-')
}

function toApp (valueIndex, arg, index, argv) {
  return argv[index + 1] === undefined || argv[index + 1] === '--app'
}

class Config {
  constructor (options = {}) {
    this.argv = options.argv || process.argv.slice(2)
    this.defaultOptions = {
      port: 8000
    }
  }

  async cli (argv) {
    argv = argv.slice()
    if (argv.length === 0) {
      return {
        _args: []
      }
    }

    const commandLineArgs = new CommandLineArgsDeepOutput(argv, [
      {
        name: 'help',
        from: arg => ['-h', '--help'].includes(arg),
        type: Boolean
      },
      {
        name: 'port',
        from: arg => arg === '--port',
        to: toSingleValue,
        type: values => values[0] !== undefined ? Number(values[0]) : undefined
      },
      {
        name: 'https',
        from: arg => arg === '--https',
        type: Boolean
      },
      {
        name: 'http2',
        from: arg => arg === '--http2',
        type: Boolean
      },
      {
        name: 'showConfig',
        from: arg => arg === '--show-config',
        type: Boolean
      },
      {
        name: 'config',
        from: arg => arg === '--config',
        to: toSingleValue,
        type: values => values[0]
      },
      {
        name: 'app',
        from: arg => arg === '--app',
        to: toSingleValue,
        type: values => values[0]
      },
      {
        name: 'title',
        from: arg => arg === '--title',
        to: toSingleValue,
        type: values => values[0]
      },
      {
        from: arg => /--(\S)+\.(\S)+\.(\S)+/.test(arg),
        def: fromArg => {
          const [group, name, type] = fromArg.substr(2).split('.')
          const dynamicDef = {
            name: extraction => `${group}.${name}`
          }
          if (type === 'number') {
            dynamicDef.to = toSingleValue
            dynamicDef.type = values => Number(values[0])
          } else if (type === 'string') {
            dynamicDef.to = toSingleValue
            dynamicDef.type = values => values[0]
          } else if (type === 'string[]') {
            dynamicDef.to = toLastItem
          } else if (type === 'flag') {
            dynamicDef.type = values => true
          } else {
            throw new Error(`Invalid option type: ${type}`)
          }
          return dynamicDef
        }
      }
    ])

    const cliOptions = commandLineArgs.parse()
    cliOptions._args = commandLineArgs.args
    return cliOptions
  }

  async stored () {
    let lwsConfigs = []
    try {
      lwsConfigs = (await import(path.resolve('lws.config.js'))).default
    } catch (err) {
      if (err.code !== 'ERR_MODULE_NOT_FOUND') {
        throw err
      } else {
        try {
          lwsConfigs = (await import(path.resolve('lws.config.mjs'))).default
        } catch (err) {
          if (err.code !== 'ERR_MODULE_NOT_FOUND') {
            throw err
          }
        }
      }
    }
    return lwsConfigs
  }

  async combine () {
    const argv = process.argv.slice(2)
    const extractions = this.getCommandExtractions(argv)
    // console.log(extractions)
    if (extractions.length === 0) {
      extractions.push(argv)
    }
    const result = []

    /* TODO: stored */
    const stored = {} //await this.stored()
    for (const ext of extractions) {
      const cli = await this.cli(ext)
      result.push(Object.assign({}, this.defaultOptions, stored, cli))
    }
    return result
  }

  getCommandExtractions (argv) {
    const commandLineArgs = new CommandLineArgs(argv,[
      {
        from: arg => arg === '--app',
        to: toApp
      }
    ])
    return commandLineArgs.getExtractions()
  }
}

export default Config
