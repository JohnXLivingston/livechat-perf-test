import type { TestSuite } from '../test-suite'

let count = 1

abstract class Task {
  protected readonly suite: TestSuite
  public readonly name: string
  private readonly definition: any
  protected readonly taskNumber: number
  private readonly waitPromises: Array<Promise<any>> = []

  constructor (suite: TestSuite, definition: any) {
    this.suite = suite
    this.definition = definition
    this.taskNumber = count++
    this.name = definition.name ?? 'T' + this.taskNumber.toString()
  }

  /**
   * The start function initialize the task, and start running it.
   */
  public abstract start (): Promise<void>

  /**
   * Waits the task end.
   */
  public async wait (): Promise<void> {
    await Promise.all(this.waitPromises)
  }

  protected log (s: string): void {
    console.log('Task ' + this.name + ': ' + s)
  }

  /**
   * Add a promise for which we must wait before ending the test suite.
   * @param p a promise
   */
  protected waitFor (p: Promise<any>): void {
    this.waitPromises.push(p)
  }
}

export {
  Task
}
