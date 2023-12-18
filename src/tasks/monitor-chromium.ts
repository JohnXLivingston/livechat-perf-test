import type { TestSuite } from '../test-suite'
import { Task } from './abstract'
import { ChromiumTask } from './chromium'
import { execPromisified } from '../lib/exec'

/**
 * This task monitors chromium spawned by puppeteer.
 */
class MonitorChromiumTask extends Task {
  protected readonly duration: number = 10000
  protected topInterval: NodeJS.Timeout | null = null

  constructor (suite: TestSuite, definition: any) {
    super(suite, definition)

    if (definition.duration && (typeof definition.duration === 'number')) {
      if (typeof definition.duration === 'number') {
        this.duration = definition.duration
      } else {
        throw new Error('Invalid duration')
      }
    }
  }

  public async start (): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.topInterval = setInterval(() => {
      this.waitFor(this.top())
    }, 200)

    this.waitFor(new Promise((resolve) => {
      setTimeout(() => {
        if (this.topInterval) { clearInterval(this.topInterval) }
        resolve(true)
      }, this.duration)
    }))
  }

  private async top (): Promise<void> {
    const chromiumPIDs: Array<{
      task: Task
      pids: string[]
      cpu?: number
    }> = await ChromiumTask.getAllChromiumPids()

    const { stdout } = await execPromisified('top -b -n 1')
    // Now, we must sum up all cpu percentage and group by task:
    stdout.toString()
      .split('\n')
      .forEach((line: string) => {
        line = line.trim()
        // ignore title and summary lines:
        if (!/^\d+\s+/.test(line)) { return }

        const s = line.split(/\s+/)
        const pid = s[0]
        const cpu = parseFloat(
          s[8]?.replace(',', '.') // in case your locale uses coma instead of dot.
        )
        for (const entry of chromiumPIDs) {
          if (entry.pids.includes(pid)) {
            entry.cpu ??= 0
            entry.cpu += cpu
          }
        }
      })

    // Adding data to the result:
    for (const entry of chromiumPIDs) {
      if (!('cpu' in entry)) {
        continue
      }
      this.suite.addData(this, entry.task.name + '_chromium_cpu', entry.cpu ?? 0)
    }
  }
}

export {
  MonitorChromiumTask
}
