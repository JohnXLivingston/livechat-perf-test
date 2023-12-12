import type { TestSuite } from '../test-suite'
import { Server } from '../server'
import { Task } from './abstract'
import { exec, spawn, ChildProcess } from 'node:child_process'
import util from 'node:util'

const execPromisified = util.promisify(exec)

interface PSResult {
  pid: string
  cmdLine: string
}

/**
 * This task monitors some resource on the server.
 */
class MonitorServerTask extends Task {
  protected readonly duration: number = 10000

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
    const pids = await this.getPIDs()
    console.log('Found following pids on the server: ', pids)
    const top = await this.spawn('top -b -p ' + Object.values(pids).join(','))

    const p = new Promise((resolve) => {
      top.on('close', () => resolve(true))
    })
    this.waitFor(p)

    top.stdout?.on('data', data => {
      const ps: {[pid: string]: number} = {}
      data.toString()
        .split('\n')
        .splice(1) // get rid of the title line
        .forEach((line: string) => {
          const s = line.split(/\s+/)
          const pid = s[0]
          const cpu = parseFloat(
            s[8]?.replace(',', '.') // in case your locale uses coma instead of dot.
          )
          ps[pid] = cpu
        })

      for (const entries of Object.entries(pids)) {
        const name = entries[0]
        const pid = entries[1]

        this.suite.addData(
          this,
          name + '_cpu',
          ps[pid]
        )
      }
    })

    setTimeout(() => {
      top.kill()
    }, this.duration)
  }

  protected async getPIDs (): Promise<{
    peertube: string
    prosody: string
    bot?: string
  }> {
    const processes: PSResult[] = (await this.exec('ps axu')).split('\n').map((l: string) => {
      const a = l.split(/\s+/)
      return {
        pid: a[1],
        cmdLine: a.splice(10).join(' ')
      }
    })

    const findProcess = (name: string, func: (p: PSResult) => boolean, optional?: boolean): PSResult | undefined => {
      const ps = processes.filter(func)
      if (optional && ps.length === 0) {
        return undefined
      }
      if (ps.length === 0) {
        throw new Error('Cant find the ' + name + ' process')
      }
      if (ps.length > 1) {
        throw new Error('Found more than 1 ' + name + ' process')
      }
      return ps[0]
    }

    const peertube = findProcess('peertube', (p: PSResult) => p.cmdLine === 'peertube')
    const prosody = findProcess('prosody', (p: PSResult) => /launcher.lua\s+prosody/.test(p.cmdLine))
    const bot = findProcess('prosody', (p: PSResult) => /xmppjs-chat-bot\s+run/.test(p.cmdLine), true)

    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      peertube: peertube!.pid,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      prosody: prosody!.pid,
      bot: bot?.pid
    }
  }

  protected async exec (cmd: string): Promise<string> {
    const server = Server.singleton()
    const { stdout } = await execPromisified(
      server.getSSHCommand() +
      cmd
    )
    return stdout
  }

  protected async spawn (cmd: string): Promise<ChildProcess> {
    const server = Server.singleton()
    const sshCmd = server.getSSHCommand().split(/\s+/)
    const args = sshCmd.splice(1)
    args.push(cmd)

    const cp = spawn(
      sshCmd[0],
      args
    )

    return cp
  }
}

export {
  MonitorServerTask
}
