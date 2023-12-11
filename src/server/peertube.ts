import type { User } from './user'
import { Server } from './server'
import { ApiSession } from './api/session'
import got from 'got'

class Peertube {
  /**
   * Check if the user defined in the servers.yaml file for this key exists on the Peertube instance.
   * @param key user key
   */
  async userExists (user: User): Promise<boolean> {
    // To check if the user exists, we just try to authenticate with
    try {
      const session = await ApiSession.getUserSession(user)
      return !!session
    } catch (error) {
      // console.log('getUserSession failed, assuming the user does not exists', error)
      return false
    }
  }

  async registerUser (user: User): Promise<void> {
    if (!user.mail) {
      throw new Error('Cant register a user without email: ' + user.login)
    }

    const server = Server.singleton()
    const conf: any = await got(
      server.url('api/v1/config/'),
      {
        method: 'GET',
        responseType: 'json',
        resolveBodyOnly: true
      }
    ).json()

    if (!conf.signup.allowed) {
      throw new Error('Server does not accept registrations.')
    }

    let url = server.url('api/v1/users/register')
    const params: any = {
      username: user.login,
      password: user.password,
      email: user.mail
    }

    if (conf.signup.requiresApproval) {
      url = server.url('api/v1/users/registrations/request')
      params.registrationReason = 'This is the perf test script'
    }

    await got(
      url,
      {
        method: 'POST',
        responseType: 'json',
        resolveBodyOnly: true,
        json: params
      }
    )
  }
}

export {
  Peertube
}
