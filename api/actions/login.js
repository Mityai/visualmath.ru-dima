import {User} from '../models/user';
import jwt from 'jsonwebtoken';
import {jwt as secret} from '../secret';

export default function login(req) {
  console.info('login')
  let {name, password} = req.body;
  console.info('name', name)
  console.info('password', !!password)
  
  return new Promise((resolve, reject) => {
    User.findOne({username: name})
      .exec((err, user) => {
        if (err) {
          console.error(err)
        }
        
        if (!user) {
          console.info(`user not found. name: ${name}`)
          reject(`Не найден пользователь: ${name}`);
          return;
        }

        if (!user.verifyPassword(password)) {
          console.info(`incorrect password for user (${name})`)
          reject(`Неверный логин или пароль`);
          return;
        }

        let plainUser = user.toObject();
        delete plainUser.hashedPassword;

        let sessionUser = {
          ...plainUser,
          token: jwt.sign(plainUser, secret, {
            expireIn: 60 * 60 * 24 * 7
          })
        };

        req.session.user = sessionUser;
        console.info(`login ok`)
        resolve(sessionUser);
      });
  });
}
