import type { TestSuite } from '../test-suite'
import type { User } from '../server/user'
import { Server } from '../server'
import { Task } from './abstract'
import { Video } from '../video'
import { ApiSession } from '../server/api/session'

/**
 * This task deletes the current video (only if allowed to: if it was created for this test).
 */
class DeleteCurrentLive extends Task {
  public readonly user: User

  constructor (suite: TestSuite, definition: any) {
    super(suite, definition)

    const key: string = definition.user.toString()
    if (!key) {
      throw new Error('Missing user key')
    }

    const user = Server.singleton().getUser(key)
    if (!user) {
      throw new Error('Missing user ' + key + ' for this server.')
    }
    this.user = user
  }

  public async start (): Promise<void> {
    const session = await ApiSession.getUserSession(this.user)

    const video = Video.singleton()
    if (!video) {
      throw new Error('No video singleton')
    }
    if (!video.canBeDeleted) {
      throw new Error('Video cant be deleted, probably because it was not created for this test run')
    }

    this.log('Deleting the video ' + video.uuid)
    await session.requestJSON(
      Server.singleton().url('api/v1/videos/' + video.uuid),
      {
        method: 'DELETE'
      }
    )
  }
}

export {
  DeleteCurrentLive
}
