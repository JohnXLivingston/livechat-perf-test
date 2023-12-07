import type { TestSuite } from '../test-suite'
import { Task } from './abstract'

/**
 * This task waits for a specified delay (in ms).
 */
class WaitTask extends Task {
  duration: number = 1000

  constructor (suite: TestSuite, definition: any) {
    super(suite, definition)

    const duration = definition.duration
    if (duration && (typeof duration === 'number')) {
      this.duration = duration
    }
  }

  public async start (): Promise<void> {
    this.log('Waiting for ' + this.duration.toString() + 'ms.')
    // The Wait task waits before returning (we are not using waitFor).
    const p = new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, this.duration)
    })
    await p
  }
}

export {
  WaitTask
}
