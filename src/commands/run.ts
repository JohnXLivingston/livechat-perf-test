import type { Command } from 'commander'
import { TestSuite } from '../test-suite/index'

function initRunCommand (program: Command): void {
  const cmd = program.command('run')
  cmd.description('Run the given test suite.')
  cmd.requiredOption(
    '-t, --test <test>',
    'The test name. There must be a folder with this name in the `tests` directory.'
  )
  cmd.action(async (options) => {
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
