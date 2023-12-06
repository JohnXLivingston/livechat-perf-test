import { Task } from './abstract'

/**
 * This task waits for a specified delay (in ms).
 */
class WaitTask extends Task {
  duration: number = 1000

  constructor (definition: any) {
    super(definition)

    const duration = definition.duration
    if (duration && (typeof duration === 'number')) {
      this.duration = duration
    }
  }

  public async start (): Promise<null> {
    this.log('Waiting for ' + this.duration.toString() + 'ms.')
    // The Wait task waits before returning.
    const p = new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, this.duration)
    })
    await p
    return null // no other promise to wait after the start.
  }
}

export {
  WaitTask
}
