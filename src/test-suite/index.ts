import type { Task } from '../tasks/abstract'
import { initTask } from '../tasks/manager'
import { parse } from 'yaml'
import fs from 'fs'
import path from 'path'

interface TestSuiteResults {
  run: string
  comments?: string
}

/**
 * Handles a test suite.
 */
class TestSuite {
  public readonly name: string
  protected readonly runNameSuffix?: string
  public readonly suiteDir: string
  public readonly configFile: string
  public readonly tasks: Task[] = []
  protected readonly comments?: string

  private results: TestSuiteResults | null = null
  private resultsDir: string | null = null
  private readonly overrideOutputDir: string | null

  constructor (options: {
    name: string
    suiteDir: string
    comments?: string
    overrideOutputDir?: string
    runNameSuffix?: string
  }) {
    this.name = options.name
    this.suiteDir = options.suiteDir
    this.runNameSuffix = options.runNameSuffix
    this.overrideOutputDir = options.overrideOutputDir ?? null
    this.comments = options.comments
    this.configFile = path.resolve(this.suiteDir, 'config.yml')
  }

  /**
   * Reads the configuration file, and load tasks.
   */
  public async readConfig (): Promise<void> {
    const fileContent = await fs.promises.readFile(this.configFile)
    const content = parse(fileContent.toString())
    if (!content) {
      throw new Error('Can\'t read the configuration file')
    }

    const tasks = content.tasks
    if (!tasks || !Array.isArray(tasks)) {
      throw new Error('No valid tasks')
    }
    for (const taskDefinition of tasks) {
      const task = initTask(this, taskDefinition)
      this.tasks.push(task)
    }
  }

  /**
   * Runs the test suite.
   */
  public async run (): Promise<void> {
    await this.prepareResults()

    this.log('Starting tasks...')
    for (const task of this.tasks) {
      await task.start()
    }

    this.log('Waiting all tasks to terminate.')
    for (const task of this.tasks) {
      await task.wait()
    }

    await this.writeResults()
  }

  protected log (s: string): void {
    console.log('TestSuite: ' + s)
  }

  /**
   * Prepare the result directory, and all related objects.
   */
  protected async prepareResults (): Promise<void> {
    const runName = (new Date()).toISOString() + (this.runNameSuffix ?? '')

    this.log('Preparing results directory and data for run ' + runName)
    this.results = {
      run: runName,
      comments: this.comments
    }
    this.resultsDir = this.overrideOutputDir
      ? path.resolve(this.overrideOutputDir, runName)
      : path.resolve(this.suiteDir, 'results', runName)

    this.log('Results will be in: ' + this.resultsDir)
    await fs.promises.mkdir(this.resultsDir, {
      recursive: true
    })
  }

  protected async writeResults (): Promise<void> {
    this.log('Writing results...')
    if (!this.results || !this.resultsDir) {
      throw new Error('Calling writeResults without any current result...')
    }
    await fs.promises.writeFile(
      path.resolve(this.resultsDir, 'data.json'),
      JSON.stringify(this.results)
    )
  }

  /**
   * Given a filename, returns a full path where you can write data for the current run results.
   * @param name the wanted filename
   * @returns the full path where to write
   */
  public async getResultFilepath (name: string): Promise<string> {
    // TODO: ensure the filename is unique.
    if (!this.resultsDir) {
      throw new Error('Calling getResultFilepath without any result directory...')
    }
    return path.resolve(this.resultsDir, name)
  }

  /**
   * Load the test suite configuration.
   * @param testSuiteName the test suite to load
   * @param options Some options to pass to the constructor.
   * @returns the TestSuite object
   */
  public static async load (testSuiteName: string, options: {
    overrideOutputDir?: string
    runNameSuffix?: string
    comments?: string
  }): Promise<TestSuite> {
    if (!testSuiteName.match(/^[a-zA-Z0-9_-]+$/)) {
      throw new Error('Invalid test suite name')
    }
    const suiteDir = path.resolve(process.cwd(), 'tests', testSuiteName)
    const testSuite = new TestSuite({
      name: testSuiteName,
      suiteDir,
      overrideOutputDir: options.overrideOutputDir,
      runNameSuffix: options.runNameSuffix,
      comments: options.comments
    })
    await testSuite.readConfig()
    return testSuite
  }
}

export {
  TestSuite
}
