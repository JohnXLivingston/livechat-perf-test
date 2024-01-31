import { Server } from '../server'
import { URL } from 'node:url'

let singleton: Video | null = null

/**
 * Class to handle the current video informations.
 */
class Video {
  public readonly uuid: string
  protected readonly server: Server
  public readonly canBeDeleted: boolean = false

  constructor (server: Server, uuid: string, canBeDeleted: boolean = false) {
    this.server = server
    this.uuid = uuid
    this.canBeDeleted = canBeDeleted
  }

  /**
   * Returns the chat url
   * @param queryParameters Query parameters to add to the url.
   */
  public chatUrl (queryParameters?: {[key: string]: string}): string {
    const base = this.server.url() + 'plugins/livechat/router/webchat/room/' + this.uuid
    if (queryParameters === undefined) {
      return base
    }
    const u = new URL(base)
    for (const k in queryParameters) {
      u.searchParams.set(k, queryParameters[k])
    }
    return u.toString()
  }

  /**
   * Sets the current video.
   * @param uuid the video uuid
   * @param canBeDeleted if true, we will allow the deletion of this video by the delete_current_live task
   */
  public static setCurrent (uuid: string, canBeDeleted?: boolean): void {
    singleton = new Video(Server.singleton(), uuid, canBeDeleted ?? false)
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
