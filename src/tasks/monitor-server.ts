import type { TestSuite } from '../test-suite'
import { Server } from '../server'
import { Task } from './abstract'
import { execPromisified } from '../lib/exec'
import { spawn, ChildProcess } from 'node:child_process'

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
    this.log('Found following pids on the server: ' + JSON.stringify(pids))
    // Top options:
    // * -d: delay between measures
    // * -b: batch mode
    // * -p: coma-separated list of pids to monitor
    const top = await this.spawn('top -d 0.2 -b -p ' + Object.values(pids).join(','))

    const pTop = new Promise((resolve) => {
      top.on('close', () => {
        this.log('Top closed.')
        resolve(true)
      })
    })
    this.waitFor(pTop)

    top.stdout?.on('data', data => {
      const ps: {[pid: string]: number} = {}
      data.toString()
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

    // const nethogs = await this.spawn(
    //   '/usr/sbin/nethogs -P ' + Object.values(pids).join(' -P '),
    //   true
    // )
    // const pNethogs = new Promise((resolve) => {
    //   nethogs.on('close', () => {
    //     this.log('Nethogs closed.')
    //     resolve(true)
    //   })
    // })
    // this.waitFor(pNethogs)

    // nethogs.stdout?.on('data', data => {
    //   this.log(data.toString())
    // })

    setTimeout(() => {
      top.kill()
      // nethogs.kill()
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

  protected async spawn (cmd: string, pseudoTty?: boolean): Promise<ChildProcess> {
    const server = Server.singleton()
    const spawnArgs = server.getSSHArguments()
    if (pseudoTty) {
      spawnArgs.push('-t')
    }
    spawnArgs.push(cmd)

    const cp = spawn(
      'ssh',
      spawnArgs
    )

    cp.on('error', (err) => {
      console.error(err)
      throw new Error('Command failed: ' + cmd)
    })

    return cp
  }
}

export {
  MonitorServerTask
}
