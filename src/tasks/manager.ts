import type { Task } from './abstract'
import type { TestSuite } from '../test-suite'
import { WaitTask } from './wait'
import { SetCurrentVideoTask } from './set-current-video'
import { ChromiumTask } from './chromium'
import { MonitorServerTask } from './monitor-server'
import { CreateLiveTask } from './create-live'
import { DeleteCurrentLive } from './delete-current-live'

/**
 * Task factory: creates the Task object from the configuration.
 * @param definition task definition
 * @returns a Task object
 */
function initTask (suite: TestSuite, definition: any): Task {
  const type = definition?.type
  if (!type || (typeof type !== 'string')) {
    throw new Error('Invalid task type')
  }

  switch (type) {
    case 'wait':
      return new WaitTask(suite, definition)
    case 'set_current_video':
      return new SetCurrentVideoTask(suite, definition)
    case 'chromium':
      return new ChromiumTask(suite, definition)
    case 'monitor_server':
      return new MonitorServerTask(suite, definition)
    case 'create_live':
      return new CreateLiveTask(suite, definition)
    case 'delete_current_live':
      return new DeleteCurrentLive(suite, definition)
    default: throw new Error('Unknown task ' + type)
  }
}

export {
  initTask
}
