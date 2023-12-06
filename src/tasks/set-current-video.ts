import { Task } from './abstract'
import { Video } from '../video'

/**
 * This task set the current video to a specified one.
 * This is not meant to be run in real tests, it is just for debugging this package.
 */
class SetCurrentVideoTask extends Task {
  public readonly uuid: string

  constructor (definition: any) {
    super(definition)

    const uuid = definition.uuid
    if ((typeof uuid !== 'string') || !uuid.match(/^[a-zA-Z0-9-]+$/)) {
      throw new Error('Invalid uuid')
    }
    this.uuid = uuid
  }

  public async start (): Promise<null> {
    Video.setCurrent(this.uuid)
    return null
  }
}

export {
  SetCurrentVideoTask
}
