import type { Page } from 'puppeteer'
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
    if ('nickname' in definition) {
      this.nickname = definition.nickname.toString()
    }

    if ('talk' in definition) {
      this.talkOptions = definition.talk
      if (!this.nickname) {
        // Before being able to talk, we must set a nickname if not provided...
        this.nickname = 'Bot for test task ' + this.taskNumber.toString()
      }
    }
  }

  public async start (): Promise<void> {
    const video = Video.singleton()
    const url = video.url()

    this.log('Loading url ' + url + ' using puppeteer...')

    const browser = await puppeteer.launch({
      headless: this.headless
    })
    const page = await browser.newPage()
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
    const nickSelector = 'input[name=nick]'
    await page.waitForSelector(nickSelector)
    await page.click(nickSelector)
    await page.keyboard.type(this.nickname)
    await page.keyboard.press('Enter')
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
        const selector = '.chat-textarea'
        await page.waitForSelector(selector)
        await page.click(selector)
        await page.keyboard.type(
          'I\'m task n°' +
          this.taskNumber.toString() +
          ', and I\'m writing a random number: ' +
          Math.random().toString()
        )
        await page.keyboard.press('Enter')
      } catch (err) {
        // Can fail if we have closed the browser... so just ignore exceptions.
      }
    }, this.talkOptions?.delay)
  }
}

export {
  ChromiumTask
}
