import { parse } from 'yaml'
import fs from 'fs'
import path from 'path'

interface User {
  login: string
  password: string
  key?: string
}

interface ServerOptions {
  name: string
  domain: string
  https: boolean
  peertube_users: User[]
}

let singleton: Server | null = null

/**
 * Represent the tested Peertube server.
 */
class Server {
  public readonly name: string
  protected options: ServerOptions

  constructor (options: ServerOptions) {
    this.options = options
    this.name = options.name
  }

  /**
   * Returns the Peertube url
   */
  public url (): string {
    let url = 'http'
    if (this.options.https) { url += 's' }
    url += '://' + this.options.domain + '/'
    return url
  }

  /**
   * Returns the login page url
   */
  public loginUrl (): string {
    return this.url() + 'login'
  }

  /**
   * Get the user informations.
   * @param key user key
   */
  public getUser (key: string): User | undefined {
    return this.options.peertube_users.find(u => key === u.key)
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
