import type { TestSuite } from '../test-suite'
import { Task } from './abstract'
import { Server } from '../server'
import { Video } from '../video'
import { Bot, HandlerRandomQuotes } from 'xmppjs-chat-bot'
import { component } from '@xmpp/component'
import { exec, ChildProcess } from 'node:child_process'

interface TalkOptions {
  delay: number
}

const sshTunnel: {
  count: number
  tunnelProcess: null | ChildProcess
} = {
  count: 0,
  tunnelProcess: null
}

/**
 * This task created a new bot, connecting as a XMPP External Component.
 * Can be used to do some heavy talking.
 */
class ExternalComponentBotTask extends Task {
  protected readonly duration: number = 10000
  protected bot: Bot
  protected readonly externalComponentKey: string
  protected readonly nickname: string | null = null
  protected readonly talkOptions: TalkOptions | null = null
  port: number

  constructor (suite: TestSuite, definition: any) {
    super(suite, definition)

    if (definition.duration && (typeof definition.duration === 'number')) {
      if (typeof definition.duration === 'number') {
        this.duration = definition.duration
      } else {
        throw new Error('Invalid duration')
      }
    }

    if ('external_component' in definition) {
      this.externalComponentKey = definition.external_component.toString()
    } else {
      throw new Error('Missing external_component in definition')
    }
    if ('nickname' in definition) {
      this.nickname = definition.nickname.toString()
    }
    if ('talk' in definition) {
      this.talkOptions = definition.talk
    }

    const server = Server.singleton()
    this.port = server.getExternalComponentPort()
    const componentDefinition = server.getExternalComponent(this.externalComponentKey)
    if (!componentDefinition) {
      throw new Error('Cant find component ' + this.externalComponentKey)
    }

    this.bot = new Bot(this.name, component({
      service: 'xmpp://127.0.0.1:' + this.port.toString(),
      domain: componentDefinition.name + '.' + server.domain(),
      password: componentDefinition.password
    }))
  }

  public async start (): Promise<void> {
    // First, we must ssh port forward:
    await this.openTunnel()

    const server = Server.singleton()
    const video = Video.singleton()

    await this.bot.connect()
    const room = await this.bot.joinRoom(video.uuid, 'room.' + server.domain(), this.nickname ?? this.name)
    const h = new HandlerRandomQuotes(this.name, room, {
      delay: (this.talkOptions?.delay ?? 1000) / 1000,
      quotes: [
        'Bot random quote 1',
        'Bot random quote 2',
        'Bot random quote 3',
        'Bot random quote 4',
        'Bot random quote 5'
      ]
    })
    await h.start()

    this.waitFor(new Promise((resolve) => {
      setTimeout(() => {
        this.log('Disconnecting the bot...')
        this.bot.disconnect().finally((): void => {
          this.log('Bot disconnected, closing the ssh tunneling')
          this.closeTunnel().finally(() => resolve(true))
        })
      }, this.duration)
    }))
  }

  protected async openTunnel (): Promise<void> {
    if (sshTunnel.tunnelProcess) {
      this.log('SSH Tunnel for component port forwarding already openned.')
      sshTunnel.count++
      return
    }
    this.log('Openning SSH Tunnel for component port forwarding.')
    const port = this.port.toString()
    const sshCommand = Server.singleton().getSSHCommand('-L ' + port + ':localhost:' + port)
    sshTunnel.tunnelProcess = exec(sshCommand)
    sshTunnel.count++

    sshTunnel.tunnelProcess.on('error', () => {
      this.log('ERROR ON SSH TUNNEL')
    })

    // Now have to wait for the port to be forwarded.
    this.log('Waiting for the tunnel...')
    const pTunnel = new Promise((resolve) => {
      sshTunnel.tunnelProcess?.stdout?.once('data', () => {
        this.log('Tunnel has written on stdout, assuming it is started')
        resolve(true)
      })
    })
    await pTunnel
  }

  protected async closeTunnel (): Promise<void> {
    this.log('Decrementing SSH Tunnel for component port count.')
    sshTunnel.count--
    if (sshTunnel.count <= 0 && sshTunnel.tunnelProcess) {
      this.log('Killing the SSH Tunnel')
      sshTunnel.tunnelProcess.kill() // FIXME: wait?
      sshTunnel.tunnelProcess = null
    }
  }
}

export {
  ExternalComponentBotTask
}
