import { parse } from 'yaml'
import fs from 'fs'
import path from 'path'

interface ServerOptions {
  name: string
  domain: string
  https: boolean
  peertube_user: {
    login: string
    password: string
  }
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
