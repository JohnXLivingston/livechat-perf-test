import type { Task } from '../tasks/abstract'
import { initTask } from '../tasks/manager'
import { parse } from 'yaml'
import fs from 'fs'
import path from 'path'

/**
 * Handles a test suite.
 */
class TestSuite {
  public readonly name: string
  public readonly workingDir: string
  public readonly configFile: string
  public readonly tasks: Task[] = []

  constructor (options: {
    name: string
    workingDir: string
  }) {
    this.name = options.name
    this.workingDir = options.workingDir
    this.configFile = path.resolve(this.workingDir, 'config.yml')
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
      const task = initTask(taskDefinition)
      this.tasks.push(task)
    }
  }

  /**
   * Runs the test suite.
   */
  public async run (): Promise<void> {
    const promises: Array<Promise<any>> = []
    for (const task of this.tasks) {
      const p = await task.start()
      if (p) {
        promises.push(p)
      }
    }

    await Promise.all(promises)
  }

  /**
   * Load the test suite configuration.
   * @param testSuiteName the test suite to load
   * @returns the TestSuite object
   */
  public static async load (testSuiteName: string): Promise<TestSuite> {
    if (!testSuiteName.match(/^[a-zA-Z0-9_-]+$/)) {
      throw new Error('Invalid test suite name')
    }
    const workingDir = path.resolve(process.cwd(), 'tests', testSuiteName)
    const testSuite = new TestSuite({
      name: testSuiteName,
      workingDir
    })
    await testSuite.readConfig()
    return testSuite
  }
}

export {
  TestSuite
}
