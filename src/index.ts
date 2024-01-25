import { Command } from 'commander'
import { initRunCommand } from './commands/run'
import { initCreateUsersCommand } from './commands/create-users'
import { initSetUsersAvatarsCommand } from './commands/set-users-avatars'
import { initComputeAverage } from './commands/compute-average'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../package.json').version

const program = new Command()
program
  .version(version, '-v --version')
  .usage('[command] [options]')
  .showHelpAfterError()

program.option(
  '-s, --server <server>',
  'The server name. If not provided, will use the first found in the configuration file.'
)

initRunCommand(program)
initCreateUsersCommand(program)
initSetUsersAvatarsCommand(program)
initComputeAverage(program)

program.parse(process.argv)
