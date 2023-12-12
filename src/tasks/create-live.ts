import type { TestSuite } from '../test-suite'
import type { User } from '../server/user'
import { Server } from '../server'
import { Task } from './abstract'
import { Video } from '../video'
import { ApiSession } from '../server/api/session'
import FormData from 'form-data'

/**
 * This task creates a new live, and set it as the current video.
 */
class CreateLiveTask extends Task {
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

    const channelId = await this.ensureTestChannel(session)
    this.log('Creating a new video on channel: ' + channelId.toString())

    const videoName = 'Task ' + this.name + ' live video.'

    const video: any = await session.requestJSON(
      Server.singleton().url('api/v1/videos/live'),
      {
        method: 'POST',
        json: {
          channelId,
          name: videoName
        }
      }
    )
    if (!video?.video?.uuid || !video.video.id) {
      throw new Error('Error creating the test video')
    }

    const uuid: string = video.video.uuid
    this.log('The test video is: ' + Server.singleton().url('videos/watch/' + uuid))

    this.log('Updating the video privacy, and enabling chat')
    const form = new FormData()
    form.append('name', videoName)
    form.append('privacy', '2') // unlisted
    form.append('pluginData[livechat-active]', 'true') // enabling the chat
    await session.requestJSON(
      Server.singleton().url('api/v1/videos/' + (video.video.id.toString() as string)),
      {
        method: 'PUT',
        body: form
      }
    )

    Video.setCurrent(uuid)
  }

  /**
   * Gets the test channel id.
   * If not found, created a test channel.
   */
  protected async ensureTestChannel (session: ApiSession): Promise<number> {
    const testChannelName = 'perf_test_channel_' + session.user.login

    const channels: any = await session.requestJSON(
      Server.singleton().url('api/v1/accounts/' + session.user.login + '/video-channels?count=100')
    )
    if (!channels?.data || !Array.isArray(channels.data)) {
      throw new Error('Fails to retrive users channels')
    }

    const channel = channels.data.find((el: any) => el.name === testChannelName)
    if (channel) {
      return parseInt(channel.id)
    }

    this.log('Must create a test channel for the user ' + session.user.login)
    const newChannel: any = await session.requestJSON(
      Server.singleton().url('api/v1/video-channels'),
      {
        method: 'POST',
        json: {
          displayName: testChannelName,
          name: testChannelName
        }
      }
    )
    if (!newChannel?.videoChannel?.id) {
      throw new Error('Failed creating the new channel')
    }
    return parseInt(newChannel.videoChannel.id)
  }
}

export {
  CreateLiveTask
}
