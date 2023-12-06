import { Task } from './abstract'
import { Video } from '../video'
import puppeteer from 'puppeteer'

/**
 * This task starts a chromium that opens the current video's chat.
 */
class ChromiumTask extends Task {
  protected readonly duration: number = 10000
  protected readonly headless: boolean = true

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

    this.log('Will close this chromium instance in ' + this.duration.toString() + 'ms.')
    const p = new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(async () => {
        this.log('Closing the browser.')
        await page.close()
        await browser.close()
        resolve(true)
      }, this.duration)
    })
    this.waitFor(p)
  }
}

export {
  ChromiumTask
}
