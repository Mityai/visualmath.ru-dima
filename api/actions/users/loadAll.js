import {User} from '../../models/user'
import {access} from '../../utils/access'
import {ADMIN} from '../../utils/roleLevels'

export let query = async () => {
  let users = await User.find({}).exec()

  for (let user of users) {
    user.hashedPassword = undefined
  }

  console.log('users')
  console.log(users)
  return users
}

export default access(
  ADMIN,
  query
)
