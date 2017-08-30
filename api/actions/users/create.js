import {User} from '../../models/user'

let create = ({ body: {login, password, access, institution, group}}) => {
  console.info('/user/create');
  console.info({
    login,
    password,
    access,
    institution,
    group
  });

  return new Promise((resolve, reject) => {
    User.findOne({username: login})
      .exec((err, usr) => {
        if (err) {
          console.error(err)
        }

        if (!usr) {
          console.info(`new user (${login}) added`)
          let user = new User({
            username: login,
            password: password,
            role: access,
            university: institution,
            group: group
          });
          user.save()

          let plainUser = user.toObject();
          delete plainUser.hashedPassword;

          console.info(`user/create ok`)
          resolve(plainUser);
        } else {
          reject(`Уже существует пользователь: ${login}`)
        }
      });
  });
}

export default create
