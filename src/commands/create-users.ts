import type { Command } from 'commander'
import type { User } from '../server/user'
import { Server } from '../server'

function initCreateUsersCommand (program: Command): void {
  const cmd = program.command('create-users')
  cmd.description('Creates missing users on the server.')
  cmd.option(
    '-k, --key <userkey...>',
    'User key to create, as defined in the server configuration file. If omitted, will create all users'
  )
  cmd.option(
    '--dont-test-login',
    'Do not try to log in before creating the user. Can be usefull to avoid "too many requests" errors.'
  )

  cmd.action(async (options) => {
    console.log('Loading server...')
    const server = await Server.load(options.server)
    console.log(`Server ${server.name} loaded.`)

    let users: User[]
    if (!options.key) {
      users = server.getUsers()
      console.log('No key option, creating all users. Number of users to check: ' + users.length.toString())
    } else {
      users = []
      for (const key of options.key) {
        const user = server.getUser(key)
        if (!user) {
          throw new Error('Can find user ' + (key as string))
        }
        users.push(user)
      }
    }
    for (const user of users) {
      if (!user.mail) {
        console.log('User without mail, skipping...')
        continue
      }
      if (!options.dontTestLogin) {
        const exists = await server.peertube.userExists(user)
        if (exists) {
          console.log('User exists: ' + user.login)
          continue
        }
        console.log('Must create user ' + user.login)
      } else {
        console.log('Trying to create user ' + user.login)
      }

      try {
        await server.peertube.registerUser(user)
      } catch (err) {
        if (options.dontTestLogin) {
          console.log('Failed creating user, assuming it is because he already exists')
        } else {
          throw err
        }
      }
    }
  })
}

export {
  initCreateUsersCommand
}
