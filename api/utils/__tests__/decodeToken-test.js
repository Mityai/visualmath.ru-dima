import {decode, getCurrentUser} from '../decodeToken'
import jwt from 'jsonwebtoken'
let secret = require('../../secret')
let jwtBefore = secret.jwt
secret.jwt = '12345 вышел зайчик погулять'
require('chai').should()
import {expect} from 'chai'

describe('decodeToken', () => {
  it('decodes a token', () => {
    let obj = {
      'зайчик': 'очень секретный'
    }

    let token = jwt.sign(obj, secret.jwt, {expireIn: 60 * 60})

    decode(token).should.be.ok
    decode(token).should.have.property('зайчик')
    decode(token)['зайчик'].should.equal(obj['зайчик'])
  })

  it('fails on wrong token', () => {
    expect(decode('лживый токен')).to.equal(null)
  })

  after(() => {
    secret.jwt = jwtBefore
  })
})
