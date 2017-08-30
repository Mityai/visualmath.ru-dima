import {User} from '../../models/user';
import {access} from '../../utils/access';

function userSet(user, prop, value) {
  if (value) {
    console.info(`setting ${prop} = ${value}`)
    user[prop] = value
  }
}

export let error = {
  notFound: `cannot find the module`
}

export let query = async ({body: {id, first_name, last_name, university, group, password}}) => {
  console.info('user/edit')
  console.info(`id (${id})`)
  let user = await User.findOne({_id: id}).exec()

  if (!user) {
    console.error('user not found')
    return Promise.reject(error.notFound)
  }

  userSet(user, 'first_name', first_name)
  userSet(user, 'last_name', last_name)
  userSet(user, 'university', university)
  userSet(user, 'group', group)
  if (password !== null) {
    userSet(user, 'password', password)
  }
  console.info('updating module')
  return await user.save()
}
