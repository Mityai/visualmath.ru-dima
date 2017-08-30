import md5 from 'md5'
import {User} from '../models/user'
import {API_ID, APP_SECRET} from '../../libs/vkAuth.js';
import jwt from 'jsonwebtoken';
import {jwt as secret} from '../secret';
/*eslint-disable*/
let loginVk = async ({ body: {uid, first_name, last_name, /* photo, photo_rec, session, */ hash }, session })=> {
  console.info('/loginVk');
  console.info({
    uid,
    first_name,
    last_name,
    hash
  });

  let calculatedHash = md5(uid + API_ID + APP_SECRET)
  console.info(`calculatedHash: ${calculatedHash}`)
  console.info(`hash: ${hash}`)

  let user = await User.findOne({vk_id: uid}).exec();
  if (!user) {
    let name = first_name + " " + last_name;
    user = new User({
      username: `${name}(${uid})`,
      name: name,
      password: calculatedHash,
      role: 'student',
      vk_id: uid,
      first_name: first_name,
      last_name: last_name
    });
    await user.save();
  }

  let plainUser = user.toObject();
  delete plainUser.hashedPassword;

  let sessionUser = {
    ...plainUser,
    token: jwt.sign(plainUser, secret, {
      expireIn: 60 * 60 * 24 * 7
    })
  };

  session.user = sessionUser;
  console.info(`loginVk ok`)
  return sessionUser;
}

export default loginVk;
