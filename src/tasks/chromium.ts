import type { Page } from 'puppeteer'
import { Server } from '../server'
import { Task } from './abstract'
import { Video } from '../video'
import puppeteer from 'puppeteer'

interface TalkOptions {
  delay: number
}

/**
 * This task starts a chromium that opens the current video's chat.
 */
class ChromiumTask extends Task {
  protected readonly duration: number = 10000
  protected readonly headless: boolean = true
  protected readonly login: string | null = null
  protected readonly nickname: string | null = null
  protected readonly talkOptions: TalkOptions | null = null
  protected talkInterval: NodeJS.Timeout | null = null

  constructor (definition: any) {
    super(definition)

    if (definition.duration && (typeof definition.duration === 'number')) {
      if (typeof definition.duration === 'number') {
        this.duration = definition.duration
      } else {
        throw new Error('Invalid duration')
      }
    }
    if ('headless' in definition) {
      this.headless = !!definition.headless
    }
    if ('login' in definition) {
      this.login = definition.login.toString()
    }
    if ('nickname' in definition) {
      this.nickname = definition.nickname.toString()
    }

    if ('talk' in definition) {
      this.talkOptions = definition.talk
      if (!this.nickname) {
        // Before being able to talk, we must set a nickname if not provided...
        this.nickname = 'Bot for test task ' + this.name
      }
    }
  }

  public async start (): Promise<void> {
    const video = Video.singleton()
    const url = video.url()

    this.log('Loading url ' + url + ' using puppeteer...')

    const browser = await puppeteer.launch({
      headless: this.headless ? 'new' : false
    })
    const page = await browser.newPage()
    await this.logIn(page)
    await page.goto(url)

    await this.setNickname(page)

    await this.startTalking(page)

    this.log('Will close this chromium instance in ' + this.duration.toString() + 'ms.')
    const p = new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(async () => {
        if (this.talkInterval) {
          clearInterval(this.talkInterval)
        }
        this.log('Closing the browser.')
        await page.close()
        await browser.close()
        resolve(true)
      }, this.duration)
    })
    this.waitFor(p)
  }

  /**
   * Set the nickname in the chat window.
   * @param page the puppeteer page
   */
  protected async setNickname (page: Page): Promise<void> {
    if (!this.nickname) { return }
    if (this.login) { return } // no nickname to choose when using an existing account
    const nickField = await page.waitForSelector('input[name=nick]')
    if (!nickField) {
      throw new Error('Can find nickname field')
    }
    await nickField.type(this.nickname)
    await nickField.press('Enter')
    await nickField.dispose()
  }

  /**
   * Logs in the user.
   * @param page the puppeteer page
   */
  protected async logIn (page: Page): Promise<void> {
    if (!this.login) { return }
    const server = Server.singleton()
    const user = server.getUser(this.login)
    if (!user) {
      throw new Error('Can`t find user ' + this.login)
    }
    await page.goto(server.loginUrl())
    const userNameField = await page.waitForSelector('#username')
    const passwordField = await page.waitForSelector('#password')
    if (!userNameField) {
      throw new Error('No username field')
    }
    if (!passwordField) {
      throw new Error('No password field')
    }
    await userNameField.type(user.login)
    await passwordField.type(user.password)
    await passwordField.press('Enter')
    await userNameField.dispose()
    await passwordField.dispose()
    await page.waitForNavigation()
  }

  /**
   * Starts talking in the chat.
   * @param page the puppeteer page
   */
  protected async startTalking (page: Page): Promise<void> {
    if (!this.talkOptions?.delay) {
      return
    }
    if (this.talkInterval) {
      clearInterval(this.talkInterval)
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.talkInterval = setInterval(async () => {
      try {
        const field = await page.waitForSelector('.chat-textarea')
        if (!field) { return }
        await field.type(
          'I\'m task ' +
          this.name +
          ', and I\'m writing a random number: ' +
          Math.random().toString()
        )
        await field.press('Enter')
        await field.dispose()
      } catch (err) {
        // Can fail if we have closed the browser... so just ignore exceptions.
      }
    }, this.talkOptions?.delay)
  }
}

export {
  ChromiumTask
}
