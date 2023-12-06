import { Task } from './abstract'

class WaitTask extends Task {
  duration: number = 1000
  constructor (definition: any) {
    super(definition)

    const duration = definition.duration
    if (duration && (typeof duration === 'number')) {
      this.duration = duration
    }
  }

  public async init (): Promise<null> {
    this.log('Waiting for ' + this.duration.toString() + 'ms.')
    const p = new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, this.duration)
    })
    await p
    return null
  }

  public async run (): Promise<void> {}
}

export {
  WaitTask
}
