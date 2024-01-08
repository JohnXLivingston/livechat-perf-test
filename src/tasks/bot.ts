import type { TestSuite } from '../test-suite'
import { Task } from './abstract'
import { Server } from '../server'
import { Video } from '../video'
import { Bot, HandlerRandomQuotes } from 'xmppjs-chat-bot'

interface TalkOptions {
  delay: number
}

/**
 * Abstract class that is used by bot tasks (see in the "bot" folder for various bots).
 */
abstract class BotTask extends Task {
  protected readonly duration: number = 10000
  protected bot: Bot | null = null
  protected readonly nickname: string | null = null
  protected readonly talkOptions: TalkOptions | null = null

  constructor (suite: TestSuite, definition: any) {
    super(suite, definition)

    if (definition.duration && (typeof definition.duration === 'number')) {
      if (typeof definition.duration === 'number') {
        this.duration = definition.duration
      } else {
        throw new Error('Invalid duration')
      }
    }

    if ('nickname' in definition) {
      this.nickname = definition.nickname.toString()
    }
    if ('talk' in definition) {
      this.talkOptions = definition.talk
    }
  }

  protected abstract getBot (): Bot

  public async start (): Promise<void> {
    const server = Server.singleton()
    const video = Video.singleton()

    this.bot = this.getBot()

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
        this.disconnect().finally(() => resolve(true))
      }, this.duration)
    }))
  }

  protected async disconnect (): Promise<void> {
    this.log('Disconnecting the bot...')
    await this.bot?.disconnect()
  }
}

export {
  BotTask
}
