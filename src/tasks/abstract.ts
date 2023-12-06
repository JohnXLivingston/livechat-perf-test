let count = 1

abstract class Task {
  definition: any
  taskNumber: number

  constructor (definition: any) {
    this.definition = definition
    this.taskNumber = count++
  }

  public abstract init (): Promise<null | Promise<any>>

  public abstract run (): Promise<void>

  protected log (s: string): void {
    console.log('Task ' + this.taskNumber.toString() + ': ' + s)
  }
}

export {
  Task
}
