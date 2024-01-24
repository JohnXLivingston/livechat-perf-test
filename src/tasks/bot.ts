import type { TestSuite } from '../test-suite'
import { Task } from './abstract'
import { Server } from '../server'
import { Video } from '../video'
import { Bot, HandlerRandomQuotes } from 'xmppjs-chat-bot'
import xml from '@xmpp/xml'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const xmppid = require('@xmpp/id')

interface TalkOptions {
  delay: number
  wait?: number
  during?: number
}

interface NickNameChangeOptions {
  nickname: string
  delay: number
}

// a list of behaviour to emulate (for example to emulate ConverseJS that gets vcards and message history)
interface EmulateOptions {
  disco: boolean // get disco info
  roster: boolean // get roster
  vcards: boolean // get vcards
  carbons: boolean
  mam: boolean // retrieve history
  // TODO: emulate ping? have to check if it is a converseJS parameter
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
  protected readonly emulateOptions: EmulateOptions | null = null
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
    if ('emulate' in definition) {
      this.emulateOptions = definition.emulate
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

  /**
   * Creates the bot.
   * @param name bot name
   */
  protected abstract getBot (name: string): Bot

  /**
   * get the host on which the user connects (anon.instance.tld, ...)
   */
  protected abstract getVirtualHost (): string

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
    const roomJID = video.uuid + '@room.' + server.domain()

    if (this.emulateOptions?.disco) {
      await this.sendDisco(bot, nickname, this.getVirtualHost(), 'info')
    }
    if (this.emulateOptions?.roster) {
      await this.sendRoster(bot, nickname)
    }
    if (this.emulateOptions?.vcards) {
      await this.sendVCard(bot, nickname)
      await this.sendVCard(bot, nickname, roomJID)
    }
    if (this.emulateOptions?.disco) {
      await this.waitMs(10)
      await this.sendDisco(bot, nickname, roomJID, 'info')
      await this.sendDisco(bot, nickname, this.getVirtualHost(), 'items')
      await this.waitMs(20)
      await this.sendDisco(bot, nickname, roomJID, 'info', 'x-roomuser-item')
    }
    if (this.emulateOptions?.carbons) {
      await this.sendCarbons(bot, nickname)
    }

    this.log('Bot ' + nickname + ' joins the room ' + video.uuid)
    const room = await bot.joinRoom(
      video.uuid,
      'room.' + server.domain(),
      nickname
    )

    if (this.emulateOptions?.mam) {
      await this.sendRetrieveMam(bot, nickname, roomJID, 50)
    }

    if (this.emulateOptions?.vcards) {
      room.on('room_roster_initialized', users => {
        this.log(`Bot "${nickname}", gettings vcards for all already connected users`)
        const f = async (): Promise<void> => {
          for (const user of users) {
            if (user.isMe()) { continue }
            await this.sendVCard(bot, nickname, user.jid.toString())
          }
        }
        f().then(() => {}, () => {})
      })
      room.on('room_joined', user => {
        this.log(`Bot "${nickname}", gettings vcard for a user that just joined`)
        this.sendVCard(bot, nickname, user.jid.toString()).then(() => {}, () => {})
      })
    }

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

        if (this.talkOptions?.during) {
          setTimeout(() => {
            this.log('Bot ' + nickname + ' stops talking')
            h.stop()
          },
          this.talkOptions.during)
        }
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

  private async sendDisco (
    bot: Bot,
    nickname: string,
    to: string,
    type: 'info' | 'items',
    node?: string
  ): Promise<void> {
    const attrs: any = {
      type: 'get',
      to,
      xmlns: 'jabber:client',
      from: bot.getAddress()?.toString(),
      id: (xmppid() as string) + ':sendIQ'
    }
    let x

    let nodeLog: string = ''
    if (node) {
      nodeLog = ' (node=' + node + ')'
      x = xml(
        'query', {
          xmlns: 'http://jabber.org/protocol/disco#' + type,
          node
        }
      )
    } else {
      x = xml(
        'query', {
          xmlns: 'http://jabber.org/protocol/disco#' + type
        }
      )
    }

    this.log(`Bot "${nickname}" sends disco get for ${to}${nodeLog}, type=${type}`)

    await bot.sendStanza(
      'iq',
      attrs,
      x
    )
  }

  private async sendRoster (bot: Bot, nickname: string): Promise<void> {
    this.log(`Bot "${nickname}" sends roster get`)
    await bot.sendStanza(
      'iq',
      {
        type: 'get',
        xmlns: 'jabber:client',
        id: (xmppid() as string) + ':roster'
      },
      xml(
        'query', {
          xmlns: 'jabber:iq:roster'
        }
      )
    )
  }

  private async sendVCard (bot: Bot, nickname: string, jid?: string): Promise<void> {
    const attrs: any = {
      type: 'get',
      xmlns: 'jabber:client',
      id: (xmppid() as string) + ':sendIQ'
    }

    if (!jid) {
      this.log(`Bot "${nickname}" get vCards for self`)
    } else {
      this.log(`Bot "${nickname}" get vCards for ${jid}`)
      attrs.to = jid
    }

    await bot.sendStanza(
      'iq',
      attrs,
      xml(
        'vCard', {
          xmlns: 'vcard-temp'
        }
      )
    )
  }

  private async sendCarbons (bot: Bot, nickname: string): Promise<void> {
    this.log(`Bot "${nickname}" set carbons`)
    await bot.sendStanza(
      'iq',
      {
        type: 'set',
        from: bot.getAddress()?.toString(),
        xmlns: 'jabber:client',
        id: (xmppid() as string) + ':sendIQ'
      },
      xml(
        'enable', {
          xmlns: 'urn:xmpp:carbons:2'
        }
      )
    )
  }

  private async sendRetrieveMam (bot: Bot, nickname: string, jid: string, max: number): Promise<void> {
    this.log(`Bot "${nickname}" will retrieve last ${max} messages`)
    await bot.sendStanza(
      'iq',
      {
        type: 'set',
        xmlns: 'jabber:client',
        id: (xmppid() as string) + ':sendIQ',
        to: jid
      },
      xml(
        'query',
        {
          xmlns: 'urn:xmpp:mam:2',
          queryid: (xmppid() as string)
        },
        xml(
          'x',
          {
            xmlns: 'jabber:x:data',
            type: 'submit'
          },
          xml(
            'field',
            {
              var: 'FORM_TYPE',
              type: 'hidden'
            },
            xml(
              'value', {}, 'urn:xmpp:mam:2'
            )
          )
        ),
        xml(
          'set',
          {
            xmlns: 'http://jabber.org/protocol/rsm'
          },
          xml(
            'max',
            {},
            '50'
          ),
          xml('before')
        )
      )
    )
  }

  private async waitMs (ms: number): Promise<true> {
    return new Promise(resolve => {
      setTimeout(() => resolve(true), ms)
    })
  }
}

export {
  BotTask
}
