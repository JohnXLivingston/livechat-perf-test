let count = 1

abstract class Task {
  private readonly definition: any
  protected readonly taskNumber: number
  private readonly waitPromises: Array<Promise<any>> = []

  constructor (definition: any) {
    this.definition = definition
    this.taskNumber = count++
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
    console.log('Task ' + this.taskNumber.toString() + ': ' + s)
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
