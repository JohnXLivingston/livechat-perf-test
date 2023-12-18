import { exec } from 'node:child_process'
import util from 'node:util'

const execPromisified = util.promisify(exec)

export {
  execPromisified
}
