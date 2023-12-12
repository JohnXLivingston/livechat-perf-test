import type { User } from './user'
import { parse } from 'yaml'
import fs from 'fs'
import path from 'path'
import { Peertube } from './peertube'

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

  /**
   * Returns the Peertube url
   */
  public url (path?: string): string {
    let url = 'http'
    if (this.options.https) { url += 's' }
    url += '://' + this.options.domain + '/'
    if (path) {
      url += path
    }
    return url
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
  public getSSHCommand (): string {
    // FIXME: we should escape/quote all parameters
    return 'ssh ' + this.getSSHArguments().join(' ') + ' '
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
