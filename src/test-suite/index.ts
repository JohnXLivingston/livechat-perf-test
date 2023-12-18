import type { Task } from '../tasks/abstract'
import { initTask } from '../tasks/manager'
import { generateCPUChart } from '../lib/chart'
import { parse } from 'yaml'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

interface TestSuiteResults {
  run: string
  comments?: string
  start: number
  data: {[taskname: string]: {[dataName: string]: Data[]}}
}

interface Data {
  timestamp: number
  value: number
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
    const time = this.secondsSinceStart()
    if (time === null) {
      console.log('TestSuite: ' + s)
    } else {
      console.log('TestSuite (' + time.toFixed(3) + 's): ' + s)
    }
  }

  /**
   * Returns the time, in second, since the start of the test suite.
   * If not started yet, returns null.
   */
  public secondsSinceStart (): number | null {
    if (!this.results?.start) {
      return null
    }
    return (Date.now() - this.results.start) / 1000
  }

  /**
   * Prepare the result directory, and all related objects.
   */
  protected async prepareResults (): Promise<void> {
    const runName = (new Date()).toISOString() + (this.runNameSuffix ?? '')

    this.log('Preparing results directory and data for run ' + runName)
    this.results = {
      run: runName,
      comments: this.comments,
      data: {},
      start: Date.now()
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
    await this.generateCharts()
    await this.compressTraceFiles()
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
   * Add a data measure in the result set.
   * @param task the task
   * @param measureName the measure name
   * @param value the value
   */
  public addData (task: Task, measureName: string, value: number): void {
    if (!this.results) {
      throw new Error('Calling addData too soon, no results for now.')
    }
    this.results.data[task.name] ??= {}
    this.results.data[task.name][measureName] ??= []
    this.results.data[task.name][measureName].push({
      timestamp: Date.now(),
      value: value
    })
  }

  /**
   * Generates charts using the results.
   */
  protected async generateCharts (): Promise<void> {
    if (!this.results) {
      throw new Error('No results, too soon to call generateCharts')
    }
    if (!this.resultsDir) {
      throw new Error('Missing resultsDir')
    }
    for (const taskName in this.results.data) {
      const taskData = this.results.data[taskName]
      await generateCPUChart(
        taskName,
        this.results.start,
        taskData,
        path.resolve(this.resultsDir, taskName + '.png')
      )
    }
  }

  /**
   * Chromium trace files can use a lot of space, and won't be accepted by github (max file size is 100Mb).
   * So we will compress them as zip.
   * In addition, the .gitignore files will ignore files ending with '.trace.json'.
   */
  public async compressTraceFiles (): Promise<void> {
    if (!this.resultsDir) {
      throw new Error('Too soon to call compressTraceFiles, no resultsDir')
    }
    const files = await fs.promises.readdir(this.resultsDir)
    for (const file of files) {
      if (!file.endsWith('.trace.json')) { continue }
      this.log('Compressing trace file: ' + file)
      execSync('zip \'' + file + '.zip\' \'' + file + '\'', {
        cwd: this.resultsDir
      })
      this.log('Removing original trace file')
      await fs.promises.rm(path.resolve(this.resultsDir, file))
    }
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
  TestSuite,
  Data
}
