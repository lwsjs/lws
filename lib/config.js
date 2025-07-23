import path from 'node:path'
import CommandLineArgs from 'command-line-args'

class CommandLineArgsDeepOutput extends CommandLineArgs {
  /* TODO: Is there any need for this code to be execute within CommandLineArgs? It doesn't access any internals and could run externally without issue. Keeps output building opinions out of CLA. */
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
  return valueIndex === 1 && !arg.startsWith('-')
}

function toLastItem (valueIndex, arg, index, argv) {
  return argv[index + 1] === undefined || argv[index + 1].startsWith('-')
}

class Config {
  constructor (options = {}) {
    this.argv = options.argv || process.argv.slice(2)
    this.defaultOptions = {
      port: 8000
    }
  }

  getServerOptions (argv) {
    argv = argv.slice()
    if (argv.length === 0) {
      return {
        _args: []
      }
    }

    const optionDefinitions = [
      {
        name: 'help',
        extractor: 'single',
        single: ['-h', '--help'],
        output: Boolean
      },
      {
        name: 'port',
        extractor: 'fromTo',
        from: ['-p', '--port'],
        to: 'singleOptionValue',
        output: values => Number(values[1])
      },
      {
        name: 'hostname',
        extractor: 'fromTo',
        from: ['--hostname'],
        to: 'singleOptionValue',
        output: values => values[1]
      },
      {
        name: 'https',
        extractor: 'single',
        single: ['--https'],
        output: Boolean
      },
      {
        name: 'http2',
        extractor: 'single',
        single: ['--http2'],
        output: Boolean
      },
      {
        name: 'showConfig',
        extractor: 'single',
        single: ['--show-config'],
        output: Boolean
      },
      {
        name: 'config',
        extractor: 'fromTo',
        from: ['--config'],
        to: 'singleOptionValue',
        output: values => values[1]
      },
      {
        name: 'app',
        extractor: 'fromTo',
        from: ['--app'],
        to: 'singleOptionValue',
        output: values => values[1]
      },
      {
        name: 'title',
        extractor: 'fromTo',
        from: arg => arg === '--title',
        to: 'singleOptionValue',
        output: values => values[1]
      },
      // { /* TODO: Could this be done in the pre-processing stage, rather than adding dynamic defs to CLA? */
      //   from: arg => /--(\S)+\.(\S)+\.(\S)+/.test(arg),
      //   def: fromArg => {
      //     const [group, name, type] = fromArg.substr(2).split('.')
      //     const dynamicDef = {
      //       name: extraction => `${group}.${name}`
      //     }
      //     if (type === 'number') {
      //       dynamicDef.to = 'singleOptionValue'
      //       dynamicDef.type = values => Number(values[0])
      //     } else if (type === 'string') {
      //       dynamicDef.to = 'singleOptionValue'
      //       dynamicDef.type = values => values[0]
      //     } else if (type === 'string[]') {
      //       dynamicDef.to = toLastItem
      //     } else if (type === 'flag') {
      //       dynamicDef.type = values => true
      //     } else {
      //       throw new Error(`Invalid option type: ${type}`)
      //     }
      //     return dynamicDef
      //   }
      // }
    ]

    const commandLineArgs = new CommandLineArgs(argv)
    const cliOptions = commandLineArgs.parse(optionDefinitions)
    cliOptions._args = commandLineArgs.origArgv
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

    if (extractions.length === 0) {
      extractions.push(argv)
    }
    // console.log(extractions)
    const result = []

    /* TODO: stored */
    const stored = {} // await this.stored()
    for (const ext of extractions) {
      /* skip the 'server' command in the first arg */
      if (ext[0] === 'server') ext.shift()
      const cli = this.getServerOptions(ext)
      result.push(Object.assign({}, this.defaultOptions, stored, cli))
    }
    return result
  }

  /**
   * Currently just one command: server
   */
  getCommandExtractions (argv) {
    const commandLineArgs = new CommandLineArgs(argv)
    const result = []
    let complete = false
    while (!complete) {
      const options = commandLineArgs.parse([
        {
          name: 'commands',
          extractor: 'fromTo',
          from: 'server',
          to: 'server'
        }
      ])
      if (options.commands?.length) {
        result.push(options.commands)
      } else {
        complete = true
      }
    }
    return result
  }
}

export default Config
