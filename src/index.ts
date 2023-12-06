import { Command } from 'commander'
import { initRunCommand } from './commands/run'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../package.json').version

const program = new Command()
program
  .version(version, '-v --version')
  .usage('[command] [options]')
  .showHelpAfterError()

initRunCommand(program)

program.parse(process.argv)
