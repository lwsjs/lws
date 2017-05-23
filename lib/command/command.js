class Command {
  optionDefinitions () {
    return []
  }
  description () { return '' }
  usage () {
    return [
      { header: 'Options', optionList: this.optionDefinitions() }
    ]
  }
}

Command.create = function () {
  return new this(...arguments)
}

module.exports = Command
