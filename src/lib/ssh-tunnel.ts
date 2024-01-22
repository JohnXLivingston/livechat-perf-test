import { Server } from '../server'
import { exec, ChildProcess } from 'node:child_process'

interface SshTunnel {
  count: number
  tunnelProcess: null | ChildProcess
  port: number
  log: (s: string) => void
}

const sshTunnels: Map<number, SshTunnel> = new Map<number, SshTunnel>()

function log (s: string, port?: number): void {
  if (!port) {
    console.log('[SSHTunnel] ' + s)
    return
  }
  console.log(`[SSHTunnel ${port.toString()}] ${s}`)
}

async function openTunnel (port: number): Promise<void> {
  let sshTunnel = sshTunnels.get(port)
  if (sshTunnel) {
    sshTunnel.log('SSH Tunnel already openned.')
    sshTunnel.count++
    return
  }

  sshTunnel = {
    port,
    tunnelProcess: null,
    count: 0,
    log: (s: string) => {
      log(s, port)
    }
  }
  sshTunnels.set(port, sshTunnel)

  sshTunnel.log('Openning SSH Tunnel for port forwarding.')
  const sshCommand = Server.singleton().getSSHCommand('-L ' + port.toString() + ':localhost:' + port.toString())
  sshTunnel.tunnelProcess = exec(sshCommand)
  sshTunnel.count++

  sshTunnel.tunnelProcess.on('error', () => {
    sshTunnel?.log('ERROR ON SSH TUNNEL')
  })

  // Now have to wait for the port to be forwarded.
  sshTunnel.log('Waiting for the tunnel...')
  const pTunnel = new Promise((resolve) => {
    sshTunnel?.tunnelProcess?.stdout?.once('data', () => {
      sshTunnel?.log('Tunnel has written on stdout, assuming it is started')
      resolve(true)
    })
  })
  await pTunnel
}

async function closeTunnel (port: number): Promise<void> {
  const sshTunnel = sshTunnels.get(port)
  if (!sshTunnel) {
    log('Cant find SSH Tunnel for port ' + port.toString() + '.')
    return
  }
  sshTunnel.log('Decrementing SSH Tunnel count.')

  sshTunnel.count--
  if (sshTunnel.count <= 0 && sshTunnel.tunnelProcess) {
    sshTunnel.log('Killing the SSH Tunnel')
    sshTunnel.tunnelProcess.kill() // FIXME: wait?
    sshTunnel.tunnelProcess = null
  }
}

export {
  openTunnel,
  closeTunnel
}
