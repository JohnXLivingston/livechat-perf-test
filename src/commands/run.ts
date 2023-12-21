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
    '--run-name <name>',
    'The name for the run. Will be used as folder name in the output directory. Defaults to current datetime.'
  )
  cmd.option(
    '--comments <comments>',
    'Some comments about this run, that will be added in the results data. ' +
    ' You can for example give some context (which livechat version, ...)'
  )
  cmd.option(
    '--output-dir <outputdir>',
    'Use this directory for output, instead of the tests suite folder.'
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

    const suite = await TestSuite.load(testSuite, {
      overrideOutputDir: options.outputDir ?? undefined,
      runName: options.runName ?? undefined,
      comments: options.comments ?? undefined
    })

    console.log('Starting test suite...')
    await suite.run()

    console.log('Tests finished.')
  })
}

export {
  initRunCommand
}
