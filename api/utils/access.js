import {decode} from './decodeToken'
import {validate} from './validateToken'
import {level} from './roleLevels'

export function templateCheck(value, errorText) {
  return value ? true : Promise.reject(errorText)
}

export let check = {
  reqNotNull: (req, errorText) => templateCheck(!!req, errorText),
  session: (req, errorText) => templateCheck(req.session, errorText),
  user: (req, errorText) => templateCheck(req.session.user, errorText),
  token: (req, errorText) => templateCheck(req.session.user.token, errorText),
  validateToken: (req, errorText) => templateCheck(validate(req.session.user.token), errorText),
  userObjectDecode: (token, errorText) => templateCheck(decode(token), errorText),
  roleLevel: (requiredAtLeast, user, errorText) => templateCheck(level(user ? user.role : null) >= level(requiredAtLeast), errorText)
}

export let errors = {
  reqNotNull: `Неверное значение req`,
  session: `Объект сессии не существует`,
  user: `Объект пользователя в сессии не существует`,
  token: `Объект пользователя должен включать в себя токен`,
  validateToken: `Неверный токен`,
  userObjectDecode: `Пользователь не найден`,
  roleLevel: `Недостаточно прав для совершения действия`
}

export function access(role, callback) {
  return async function (req, res) {
    let userObject
    if (role) {

      let reqNotNull = check.reqNotNull(req, errors.reqNotNull)
      if (reqNotNull !== true) {
        return reqNotNull
      }

      let session = check.session(req, errors.session)
      if (session !== true) {
        return session
      }

      let user = check.user(req, errors.user)
      if (user !== true) {
        return user
      }
      
      let token = check.token(req, errors.token)
      if (token !== true) {
        return token
      }

      let validToken = check.validateToken(req, errors.validateToken)
      if (validToken !== true) {
        return validToken
      }

      let userObjectDecode = check.userObjectDecode(req.session.user.token, errors.userObjectDecode)
      if (userObjectDecode !== true) {
        return userObjectDecode
      } else {
        userObject = decode(req.session.user.token)
      }

      let level = check.roleLevel(role, userObject, errors.roleLevel)
      if (level !== true) {
        return level
      }
    }

    return await callback(req, res, userObject)
  }
}
