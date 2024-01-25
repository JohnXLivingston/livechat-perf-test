import type { Command } from 'commander'
import { Server } from '../server'
import { TestSuite } from '../test-suite'

function initComputeAverage (program: Command): void {
  const cmd = program.command('compute-average')
  cmd.description('Compute an average from a result data set.')
  cmd.requiredOption(
    '-t, --test <test>',
    'The test name. There must be a folder with this name in the `tests` directory.'
  )
  cmd.requiredOption(
    '--run-name <name>',
    'The name for the run. Will be used as folder name in the output directory. Defaults to current datetime.'
  )
  cmd.option(
    '--after <after>',
    'Only computes on values after the given timecode. ' +
    'This timecode is a number of seconds since the test start (can be fractional).'
  )
  cmd.option(
    '--before <before>',
    'Only computes on values after the given timecode. ' +
    'This timecode is a number of seconds since the test start (can be fractional).',
    parseFloat
  )
  cmd.option(
    '--output-dir <outputdir>',
    'Use this directory for output, instead of the tests suite folder.',
    parseFloat
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
    const run: string = options.runName.toString()
    console.log(`Computing averages for test ${testSuite}, run ${run}`)

    const suite = await TestSuite.load(testSuite, {
      overrideOutputDir: options.outputDir ?? undefined,
      runName: options.runName ?? undefined,
      comments: options.comments ?? undefined
    })

    const results = await suite.getResults()
    const data = results.data

    const after = options.after ? (options.after * 1000 + results.start) : undefined
    const before = options.before ? (options.before * 1000 + results.start) : undefined

    for (const taskName in data) {
      const taskData = data[taskName]
      for (const dataName in taskData) {
        const values = taskData[dataName]
        let t = 0
        let n = 0
        for (let i = 0; i < values.length; i++) {
          if (after !== undefined && values[i].timestamp < after) {
            continue
          }
          if (before !== undefined && values[i].timestamp > before) {
            continue
          }
          t += values[i].value
          n++
        }
        const a = t / n
        console.log(`${taskName} / ${dataName}: ${a.toFixed(2)}`)
      }
    }
  })
}

export {
  initComputeAverage
}
