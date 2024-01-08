import { BotTask } from '../bot'
import { Server } from '../../server'
import { client } from '@xmpp/client'
import { Bot } from 'xmppjs-chat-bot'

/**
 * This task created a new bot, connecting through Websocket to the anonymous virtualhost.
 * Can be used to do some heavy talking.
 */
class WebsocketAnonymousBotTask extends BotTask {
  protected getBot (name: string): Bot {
    const server = Server.singleton()

    // service: something like 'wss://video.instance.tld/plugins/livechat/ws/xmpp-websocket'
    const service = server.webSocketUrl()
    const domain = 'anon.' + server.domain()

    return new Bot(name, client({
      service,
      domain
    }))
  }
}

export {
  WebsocketAnonymousBotTask
}
