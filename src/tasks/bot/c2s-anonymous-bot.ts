import type { TestSuite } from '../../test-suite'
import { BotTask } from '../bot'
import { Server } from '../../server'
import { openTunnel, closeTunnel } from '../../lib/ssh-tunnel'
import { client } from '@xmpp/client'
import { Bot } from 'xmppjs-chat-bot'

/**
 * This task created a new bot, connecting through Websocket to the anonymous virtualhost.
 * Can be used to do some heavy talking.
 */
class C2SAnonymousBotTask extends BotTask {
  protected readonly port: number
  protected readonly sshTunneling: boolean

  constructor (suite: TestSuite, definition: any) {
    super(suite, definition)

    const server = Server.singleton()
    const c2s = server.getC2SPortInfos()
    this.port = c2s.port
    this.sshTunneling = c2s.ssh_tunneling
  }

  protected getBot (name: string): Bot {
    const server = Server.singleton()

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0' // to accept self signed certificates.

    const host = this.sshTunneling ? '127.0.0.1' : server.domain()
    const service = 'xmpp://' + host + ':' + this.port.toString()
    const domain = 'anon.' + server.domain()

    return new Bot(name, client({
      service,
      domain
    }))
  }

  public async start (): Promise<void> {
    // First, we must ssh port forward:
    if (this.sshTunneling) { await openTunnel(this.port) }
    return super.start()
  }

  protected async disconnect (): Promise<void> {
    await super.disconnect()

    if (this.sshTunneling) {
      this.log('Bot disconnected, closing the ssh tunneling')
      await closeTunnel(this.port)
    }
  }
}

export {
  C2SAnonymousBotTask
}
