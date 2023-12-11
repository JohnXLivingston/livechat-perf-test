import type { Command } from 'commander'
import { Server } from '../server'

function initCreateUsersCommand (program: Command): void {
  const cmd = program.command('create-users')
  cmd.description('Creates missing users on the server.')
  cmd.option(
    '--dont-test-login',
    'Do not try to log in before creating the user. Can be usefull to avoid "too many requests" errors.'
  )

  cmd.action(async (options) => {
    console.log('Loading server...')
    const server = await Server.load(options.server)
    console.log(`Server ${server.name} loaded.`)

    const users = server.getUsers()
    console.log('Number of users to check: ' + users.length.toString())
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
