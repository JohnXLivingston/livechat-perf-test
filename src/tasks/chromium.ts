import type { TestSuite } from '../test-suite'
import type { Page } from 'puppeteer'
import { Server } from '../server'
import { Task } from './abstract'
import { Video } from '../video'
import { execPromisified } from '../lib/exec'
import puppeteer from 'puppeteer'

interface TalkOptions {
  delay: number
}

interface ChromiumPids {
  task: Task
  pids: string[]
}

const mainPids = new Map<Task, number>()

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
  protected readonly trace: boolean = false
  protected readonly queryParameters: {[key: string]: string} | undefined = undefined

  constructor (suite: TestSuite, definition: any) {
    super(suite, definition)

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

    if ('query_parameters' in definition) {
      this.queryParameters = definition.query_parameters
    }

    this.trace = !!definition.trace
  }

  public async start (): Promise<void> {
    const video = Video.singleton()
    const url = video.chatUrl(this.queryParameters)

    this.log('Loading url ' + url + ' using puppeteer...')

    const browser = await puppeteer.launch({
      headless: this.headless ? 'new' : false
    })
    const pid = browser.process()?.pid
    if (pid) {
      this.log('Browser started with PID ' + (pid.toString() ?? ''))
      mainPids.set(this, pid)
    }

    const page = await browser.newPage()

    if (this.trace) {
      await page.tracing.start({
        path: await this.suite.getResultFilepath(this.name + '.trace.json')
      })
    }

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
        if (this.trace) {
          await page.tracing.stop()
        }
        this.log('Closing the browser.')
        await page.close()
        await browser.close()
        mainPids.delete(this)
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

        const msg = 'I\'m task ' +
          this.name +
          ', and I\'m writing a random number: ' +
          Math.random().toString()

        await field.type(msg)

        await field.press('Enter')
        await field.dispose()
      } catch (err) {
        // Can fail if we have closed the browser... so just ignore exceptions.
      }
    }, this.talkOptions?.delay)
  }

  /**
   * Returns for each running task the list of all corresponding PIDs.
   */
  public static async getAllChromiumPids (): Promise<ChromiumPids[]> {
    const result: ChromiumPids[] = []
    for (const [task, mainPID] of mainPids.entries()) {
      const { stdout } = await execPromisified('pstree -p ' + mainPID.toString())
      const pids = new Set([...stdout.matchAll(/\((\d+)\)/g)].map(m => m[1]).sort())
      result.push({
        task,
        pids: [...pids.values()]
      })
    }
    return result
  }
}

export {
  ChromiumTask
}
