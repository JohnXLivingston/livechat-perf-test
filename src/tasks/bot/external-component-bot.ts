import type { TestSuite } from '../../test-suite'
import { BotTask } from '../bot'
import { Server } from '../../server'
import { openTunnel, closeTunnel } from '../../lib/ssh-tunnel'
import { component } from '@xmpp/component'
import { Bot } from 'xmppjs-chat-bot'

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

  protected getBot (name: string): Bot {
    if (!this.componentDefinition) {
      throw new Error('Missing component definition')
    }
    return new Bot(name, component({
      service: 'xmpp://127.0.0.1:' + this.port.toString(),
      domain: this.getVirtualHost(),
      password: this.componentDefinition.password
    }))
  }

  protected getVirtualHost (): string {
    if (!this.componentDefinition) {
      throw new Error('Missing component definition')
    }
    return this.componentDefinition.name + '.' + Server.singleton().domain()
  }

  public async start (): Promise<void> {
    // First, we must ssh port forward:
    await openTunnel(this.port)
    return super.start()
  }

  protected async disconnect (): Promise<void> {
    await super.disconnect()

    this.log('Bot disconnected, closing the ssh tunneling')
    await closeTunnel(this.port)
  }
}

export {
  ExternalComponentBotTask
}
