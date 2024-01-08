import type { TestSuite } from '../../test-suite'
import { BotTask } from '../bot'
import { Server } from '../../server'
import { component } from '@xmpp/component'
import { exec, ChildProcess } from 'node:child_process'
import { Bot } from 'xmppjs-chat-bot'

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
class ExternalComponentBotTask extends BotTask {
  protected readonly externalComponentKey: string
  protected readonly componentDefinition: ReturnType<Server['getExternalComponent']>
  port: number

  constructor (suite: TestSuite, definition: any) {
    super(suite, definition)

    if ('external_component' in definition) {
      this.externalComponentKey = definition.external_component.toString()
    } else {
      throw new Error('Missing external_component in definition')
    }

    const server = Server.singleton()
    this.port = server.getExternalComponentPort()
    this.componentDefinition = server.getExternalComponent(this.externalComponentKey)
    if (!this.componentDefinition) {
      throw new Error('Cant find component ' + this.externalComponentKey)
    }
  }

  protected getBot (): Bot {
    const server = Server.singleton()
    if (!this.componentDefinition) {
      throw new Error('Missing component definition')
    }
    return new Bot(this.name, component({
      service: 'xmpp://127.0.0.1:' + this.port.toString(),
      domain: this.componentDefinition.name + '.' + server.domain(),
      password: this.componentDefinition.password
    }))
  }

  public async start (): Promise<void> {
    // First, we must ssh port forward:
    await this.openTunnel()
    return super.start()
  }

  protected async disconnect (): Promise<void> {
    await super.disconnect()

    this.log('Bot disconnected, closing the ssh tunneling')
    await this.closeTunnel()
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
