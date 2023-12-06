import type { Command } from 'commander'
import { TestSuite } from '../test-suite/index'
import { Server } from '../server'

function initRunCommand (program: Command): void {
  const cmd = program.command('run')
  cmd.description('Run the given test suite.')
  cmd.requiredOption(
    '-t, --test <test>',
    'The test name. There must be a folder with this name in the `tests` directory.'
  )
  cmd.option(
    '-s, --server <server>',
    'The server name. If not provided, will use the first found in the configuration file.'
  )

  cmd.action(async (options) => {
    console.log('Loading server...')
    const server = await Server.load(options.server)
    console.log(`Server ${server.name} loaded.`)

    const testSuite: string = options.test.toString()
    console.log('Loading test suite ' + testSuite + '...')

    const suite = await TestSuite.load(testSuite)

    console.log('Starting test suite...')
    await suite.run()

    console.log('Tests finished.')
  })
}

export {
  initRunCommand
}
