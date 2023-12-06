let count = 1

abstract class Task {
  definition: any
  taskNumber: number

  constructor (definition: any) {
    this.definition = definition
    this.taskNumber = count++
  }

  /**
   * The start function initialize the task, and start running it.
   * The calling code must wait for the start promise (meaning the task has finished its initialization).
   * The start method can return another promise: this promise will be resolved with the task has finished.
   */
  public abstract start (): Promise<null | Promise<any>>

  protected log (s: string): void {
    console.log('Task ' + this.taskNumber.toString() + ': ' + s)
  }
}

export {
  Task
}
