import {User} from '../../models/user';
import {access} from '../../utils/access';

export let query = async ({body: {id}}) => {
  let user = await User.findOne({_id: id}).exec()
  user = user.toObject()
  delete user.hashedPassword
  console.log('user')
  console.log(user)
  return user
}

export default access(
  'student',
  query
);
