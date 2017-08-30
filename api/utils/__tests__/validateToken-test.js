import {validate} from '../validateToken'
require('chai').should()
import jwt from 'jsonwebtoken'
let secret = require('../../secret')
let jwtBefore = secret.jwt
secret.jwt = '12345 вышел зайчик погулять'

describe('validateToken', () => {
  it('validates a token', () => {
    let obj = {
      'зайчик': 'очень секретный'
    }

    let token = jwt.sign(obj, secret.jwt, {expireIn: 60 * 60})

    validate(token).should.be.ok
  })

  it('fails on wrong token', () => {
    let falseToken = 'лживый токен!'
    validate(falseToken).should.be.not.ok
  })

  after(() => {
    secret.jwt = jwtBefore
  })
})
