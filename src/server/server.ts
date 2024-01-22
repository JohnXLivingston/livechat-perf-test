import type { User } from './user'
import { parse } from 'yaml'
import fs from 'fs'
import path from 'path'
import { Peertube } from './peertube'

interface ExternalComponent {
  key?: string
  name: string
  password: string
}

interface ServerOptions {
  name: string
  domain: string
  ssh_domain?: string
  https: boolean
  peertube_users: User[]
  videos?: Array<{
    key: string
    uuid: string
  }>
  xmpp_c2s?: {
    port: number
    ssh_tunneling?: boolean
  }
  xmpp_external_components?: {
    port: number
    components: ExternalComponent[]
  }
}

let singleton: Server | null = null

/**
 * Represent the tested Peertube server.
 */
class Server {
  public readonly name: string
  public readonly peertube: Peertube
  protected options: ServerOptions

  constructor (options: ServerOptions) {
    this.options = options
    this.name = options.name
    this.peertube = new Peertube()
  }

  public domain (): string {
    return this.options.domain
  }

  /**
   * Returns the Peertube url
   */
  public url (path?: string, scheme?: 'http' | 'ws'): string {
    let url = scheme ?? 'http'
    if (this.options.https) { url += 's' }
    url += '://' + this.options.domain + '/'
    if (path) {
      url += path
    }
    return url
  }

  public webSocketUrl (): string {
    return this.url('plugins/livechat/ws/xmpp-websocket', 'ws')
  }

  /**
   * Returns the login page url
   */
  public loginUrl (): string {
    return this.url('login')
  }

  /**
   * Get the user informations.
   * @param key user key
   */
  public getUser (key: string): User | undefined {
    return this.options.peertube_users.find(u => key === u.key)
  }

  /**
   * Returns all configured users.
   */
  public getUsers (): User[] {
    return this.options.peertube_users ?? []
  }

  /**
   * Gets the video uuid, by key.
   * @param key video key
   * @returns the video uuid
   */
  public getVideoUuid (key: string): string | undefined {
    return this.options.videos?.find(v => v.key === key)?.uuid
  }

  /**
   * Returns the ssh command to connect to the server.
   * Will add an extra space at the end, so you can concat to any command to run.
   */
  public getSSHCommand (commandLineOptions?: string): string {
    // FIXME: we should escape/quote all parameters
    return 'ssh ' + (commandLineOptions ?? '') + ' ' + this.getSSHArguments().join(' ') + ' '
  }

  /**
   * Returns the ssh arguments to pass to connect to the server.
   */
  public getSSHArguments (): string[] {
    return [
      this.options.ssh_domain ?? this.options.domain
    ]
  }

  /**
   * Returns the port for extern components on your peertube server.
   */
  public getExternalComponentPort (): number {
    if (!this.options?.xmpp_external_components?.port) {
      throw new Error('No port configured for external components.')
    }
    return this.options.xmpp_external_components.port
  }

  /**
   * Get the external component informations.
   * @param key user key
   */
  public getExternalComponent (key: string): ExternalComponent | undefined {
    return this.options.xmpp_external_components?.components?.find(c => key === c.key)
  }

  /**
   * Get the C2S port informations (port number, and if ssh tunneling is needed).
   */
  public getC2SPortInfos (): {
    port: number
    ssh_tunneling: boolean
  } {
    if (!this.options?.xmpp_c2s?.port) {
      throw new Error('No port configured for C2S.')
    }

    return {
      port: this.options.xmpp_c2s.port,
      ssh_tunneling: this.options.xmpp_c2s.ssh_tunneling === true
    }
  }

  /**
   * Gets the Server singleton
   * @returns the server singleton
   */
  public static singleton (): Server {
    if (!singleton) {
      throw new Error('Too soon to call the Server.singleton, not initialized yet.')
    }
    return singleton
  }

  /**
   * Load the server configuration from the configuration file.
   * @param name optional server name
   */
  public static async load (name?: string): Promise<Server> {
    const configFilePath = path.resolve(process.cwd(), 'config', 'servers.yml')
    const fileContent = await fs.promises.readFile(configFilePath)
    const content = parse(fileContent.toString())
    if (!content || !content.servers || !Array.isArray(content.servers)) {
      throw new Error('Invalid servers configuration file')
    }
    for (const def of content.servers) {
      if (name) {
        if (def.name !== name) {
          continue
        }
      }
      const server = new Server(def)
      singleton = server
      return server
    }
    throw new Error('Can\'t find the server')
  }
}

export {
  Server
}
