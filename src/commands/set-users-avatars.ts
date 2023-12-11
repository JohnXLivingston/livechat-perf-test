import type { Command } from 'commander'
import type { User } from '../server/user'
import { Server } from '../server'
import { ApiSession } from '../server/api/session'
import sharp from 'sharp'
import FormData from 'form-data'
import md5 from 'md5'

async function getAvatar (user: User): Promise<Buffer> {
  let text: string
  if (user.key) {
    text = user.key.split('').filter(s => s.match(/\d/)).join('')
  }
  text ??= user.login

  const color = '#' + md5(user.login).slice(0, 6)

  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xml:space="preserve"
    style="
      shape-rendering:geometricPrecision;
      text-rendering:geometricPrecision;
      image-rendering:optimizeQuality;
      fill-rule:evenodd;
      clip-rule:evenodd
    "
    viewBox="0 0 500 500"
  >
    <g id="group">
      <circle style="fill:${color};stroke:${color};stroke-width:1.6871;stroke-miterlimit:10;" cx="250" cy="250" r="245">
      </circle>
      <text
        x="50%" y="50%"
        text-anchor="middle"
        stroke="black"
        stroke-width="4px"
        dy=".3em"
        font-size="24em"
      >${text}</text>
    </g>
  </svg>`)

  return sharp(svg).resize(120, 120).jpeg({ quality: 95, mozjpeg: true }).toBuffer()
}

function initSetUsersAvatarsCommand (program: Command): void {
  const cmd = program.command('set-users-avatars')
  cmd.description('Creates missing user avatars on the server.')
  cmd.option(
    '-k, --key <userkey...>',
    'User key for which to create the avatar, as defined in the server configuration file. ' +
    'If omitted, will do for all users'
  )
  cmd.option(
    '-f, --force',
    'Override user avatar, even if the user already has an avatar.'
  )

  cmd.action(async (options) => {
    console.log('Loading server...')
    const server = await Server.load(options.server)
    console.log(`Server ${server.name} loaded.`)

    let users: User[]
    if (!options.key) {
      users = server.getUsers()
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
      const session = await ApiSession.getUserSession(user)

      if (!options.force) {
        console.log('Checking if user has an avatar: ' + user.login)
        const peertubeUser: any = await session.requestJSON(
          server.url('api/v1/users/me')
        )
        if (peertubeUser.account?.avatars?.length) {
          console.log('User already has an avatar: ' + user.login)
          continue
        }
      }

      console.log('Must add an avatar for user ' + user.login)
      const avatar = await getAvatar(user)

      const form = new FormData()
      form.append('avatarfile', avatar, {
        contentType: 'image/jpeg',
        filename: 'avatar.jpg'
      })

      await session.requestJSON(
        server.url('api/v1/users/me/avatar/pick'),
        {
          method: 'POST',
          body: form
        }
      )
    }
  })
}

export {
  initSetUsersAvatarsCommand
}
