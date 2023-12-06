import { Server } from '../server'

let singleton: Video | null = null

/**
 * Class to handle the current video informations.
 */
class Video {
  public readonly uuid: string
  protected readonly server: Server

  constructor (server: Server, uuid: string) {
    this.server = server
    this.uuid = uuid
  }

  /**
   * Returns the video url
   */
  public url (): string {
    return this.server.url() + 'plugins/livechat/router/webchat/room/' + this.uuid
  }

  /**
   * Sets the current video.
   * @param uuid the video uuid
   */
  public static setCurrent (uuid: string): void {
    singleton = new Video(Server.singleton(), uuid)
  }

  /**
   * Video singleton. Keeps the current video, on which chat the tests are run.
   * @returns the current video
   */
  public static singleton (): Video {
    if (!singleton) {
      throw new Error('No current video for now.')
    }
    return singleton
  }
}

export {
  Video
}
