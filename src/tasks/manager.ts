import type { Task } from './abstract'
import { WaitTask } from './wait'
import { SetCurrentVideoTask } from './set-current-video'
import { ChromiumTask } from './chromium'

/**
 * Task factory: creates the Task object from the configuration.
 * @param definition task definition
 * @returns a Task object
 */
function initTask (definition: any): Task {
  const name = definition?.name
  if (!name || (typeof name !== 'string')) {
    throw new Error('Invalid task name')
  }

  switch (name) {
    case 'wait':
      return new WaitTask(definition)
    case 'set_current_video':
      return new SetCurrentVideoTask(definition)
    case 'chromium':
      return new ChromiumTask(definition)
    default: throw new Error('Unknown task ' + name)
  }
}

export {
  initTask
}
