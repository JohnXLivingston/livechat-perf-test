import type { OptionsOfJSONResponseBody, CancelableRequest, Options } from 'got'
import { User, Server } from '../index'
import got from 'got'

interface Client {
  clientId: string
  clientSecret: string
}

interface Token {
  accessToken: string
  tokenType: 'bearer'
}

let client: Client | undefined

const sessions: Map<string, ApiSession> = new Map<string, ApiSession>()

class ApiSession {
  public readonly user: User
  public readonly token: Token

  constructor (user: User, token: Token) {
    this.user = user
    this.token = token
  }

  async requestJSON (url: string, parameters?: Options): Promise<CancelableRequest> {
    parameters ??= {}
    parameters.method ??= 'GET'
    parameters.responseType ??= 'json'
    parameters.resolveBodyOnly ??= true

    // Adding the Bearer headers:
    parameters.headers ??= {}
    parameters.headers.Authorization = this.token.tokenType + ' ' + this.token.accessToken

    return got(
      url,
      parameters as OptionsOfJSONResponseBody
    ).json()
  }

  static async getUserSession (user: User): Promise<ApiSession> {
    if (sessions.has(user.login)) {
      return sessions.get(user.login) as ApiSession
    }

    const server = Server.singleton()

    const client = await ApiSession.getClient()
    const auth: any = await got(
      server.url('api/v1/users/token'),
      {
        method: 'POST',
        responseType: 'json',
        resolveBodyOnly: true,
        form: {
          client_id: client.clientId,
          client_secret: client.clientSecret,
          grant_type: 'password',
          response_type: 'code',
          username: user.login,
          password: user.password
        }
      }
    ).json()

    if (!auth || !auth.access_token) {
      throw new Error('Cant get the user token')
    }

    const token: Token = {
      accessToken: auth.access_token,
      tokenType: auth.token_type
    }
    const session = new ApiSession(user, token)
    sessions.set(user.login, session)
    return session
  }

  static async getClient (): Promise<Client> {
    if (client) return client

    const server = Server.singleton()
    const r: any = await got(server.url('api/v1/oauth-clients/local'), {
      method: 'GET',
      responseType: 'json',
      resolveBodyOnly: true
    }).json()
    if (!r || !r.client_id || !r.client_secret) {
      throw new Error('Cant get the server client')
    }

    client = {
      clientId: r.client_id,
      clientSecret: r.client_secret
    }
    return client
  }
}

export {
  ApiSession
}
