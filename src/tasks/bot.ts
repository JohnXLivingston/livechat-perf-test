import type { TestSuite } from '../test-suite'
import { Task } from './abstract'
import { Server } from '../server'
import { Video } from '../video'
import { Bot, HandlerRandomQuotes } from 'xmppjs-chat-bot'

interface TalkOptions {
  delay: number
  wait?: number
}

interface NickNameChangeOptions {
  nickname: string
  delay: number
}

/**
 * Abstract class that is used by bot tasks (see in the "bot" folder for various bots).
 */
abstract class BotTask extends Task {
  protected readonly duration: number = 10000
  protected bots: Bot[] = []
  protected readonly nickname: string | null = null
  protected readonly talkOptions: TalkOptions | null = null
  protected readonly nicknameChangeOptions: NickNameChangeOptions | null = null
  protected botNumber: number = 1
  protected delayBetweenBots: number = 100

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
    if ('nickname_change' in definition) {
      this.nicknameChangeOptions = definition.nickname_change
    }

    if ('bot_number' in definition) {
      this.botNumber = parseInt(definition.bot_number)
    } else {
      this.botNumber = 1
    }
    if (isNaN(this.botNumber) || this.botNumber < 1) {
      throw new Error('Invalid multiple parameter')
    }

    if ('delay_between_bots' in definition) {
      this.delayBetweenBots = parseInt(definition.delay_between_bots)
    }
    if (isNaN(this.delayBetweenBots) || this.delayBetweenBots < 1) {
      throw new Error('Invalid delay_between_bots parameter')
    }
  }

  protected abstract getBot (name: string): Bot

  public async start (): Promise<void> {
    const server = Server.singleton()
    const video = Video.singleton()

    for (let i = 1; i <= this.botNumber; i++) {
      const suffix = this.botNumber > 1 ? '_' + i.toString() : ''
      const bot = this.getBot(this.name + suffix)
      this.bots.push(bot)

      bot.connect().then(async () => {
        await this.runBot(bot, i, server, video)
      }, () => {})

      if (this.delayBetweenBots) {
        await new Promise(resolve => {
          setTimeout(resolve, this.delayBetweenBots)
        })
      }
    }

    this.waitFor(new Promise((resolve) => {
      setTimeout(() => {
        this.disconnect().finally(() => resolve(true))
      }, this.duration)
    }))
  }

  private async runBot (bot: Bot, i: number, server: Server, video: Video): Promise<void> {
    const nicknameSuffix = this.botNumber > 1 ? ' ' + i.toString() : ''
    let nickname = (this.nickname ?? this.name) + nicknameSuffix

    this.log('Bot ' + nickname + ' joins the room ' + video.uuid)
    const room = await bot.joinRoom(
      video.uuid,
      'room.' + server.domain(),
      nickname
    )

    if (this.talkOptions) {
      setTimeout(() => {
        this.log('Bot ' + nickname + ' starts talking')
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
        h.start()
      }, this.talkOptions.wait ?? 0)
    }

    if (this.nicknameChangeOptions) {
      setTimeout(() => {
        if (this.nicknameChangeOptions) {
          const oldNickname = nickname
          nickname = this.nicknameChangeOptions?.nickname + nicknameSuffix
          this.log('Bot ' + oldNickname + ' changes nickname for ' + nickname)
          // To change nickname, just join again. This will emit a new presence stanza.
          bot.joinRoom(
            video.uuid,
            'room.' + server.domain(),
            nickname
          ).then(() => {}, () => {})
        }
      }, this.nicknameChangeOptions.delay)
    }
  }

  protected async disconnect (): Promise<void> {
    this.log('Disconnecting the bot(s)...')
    const promises = []
    for (const bot of this.bots) {
      this.log('Disconnecting bot ' + bot.botName)
      promises.push(bot.disconnect())
      if (this.delayBetweenBots) {
        // Also waiting for disconnection.
        await new Promise(resolve => {
          setTimeout(resolve, this.delayBetweenBots)
        })
      }
    }
    await Promise.all(promises)
  }
}

export {
  BotTask
}
