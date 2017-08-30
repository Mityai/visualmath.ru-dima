require('chai').should()
import {access, templateCheck, check, errors} from '../access'
import {STUDENT, TEACHER, ADMIN} from '../roleLevels'

let errorText = 'Текст ошибки'

describe('access', () => {
  describe('templateCheck', () => {
    it('returns true on truthy values', () => {
      templateCheck(true).should.equal(true)
    })

    it('returns rejected promise on false values', () => {
      templateCheck(false).catch.should.be.ok
    })

    it('rejects promise', done => {
      templateCheck(false, errorText).catch(value => {
        value.should.equal(errorText)
        done()
      })
    })
  })

  describe('check.reqNotNull', () => {
    it('checks if req obj is ok', () => {
      check.reqNotNull(true).should.equal(true)
    })

    it('fails if req is not ok', done => {
      check.reqNotNull(false, errorText).catch.should.be.ok
      check.reqNotNull(false, errorText).catch(error => {
        error.should.equal(errorText)
        done()
      })
    })
  })

  describe('check.session', () => {
    it('checks if session exists', () => {
      check.session({session: {}}).should.equal(true)
    })

    it(`fails if session doesn't exist`, done => {
      check.session({}, errorText).catch.should.be.ok
      check.session({}, errorText).catch(error => {
        error.should.equal(errorText)
        done()
      })
    })
  })

  describe('check.user', () => {
    it('checks that user exists', () => {
      check.user({session: {user: {}}}).should.equal(true)
    })

    it(`fails if users doesn't exist`, done => {
      check.user({session: {}}).catch.should.be.ok
      check.user({session: {}}, errorText).catch(error => {
        error.should.equal(errorText)
        done()
      })
    })
  })

  describe('check.token', () => {
    it('checks if the user contains a token', () => {
      check.token({session: {user: {token: 'ляляля'}}}).should.equal(true)
    })

    it(`fails if the user doesn't contains a token`, done => {
      check.token({session: {user: {}}}, errorText).catch.should.be.ok
      check.token({session: {user: {}}}, errorText).catch(error => {
        error.should.equal(errorText)
        done()
      })
    })
  })

  describe('validateToken', () => {
    let jwt, jwtBefore, secret
    before(() => {
      jwt = require('jsonwebtoken')
      secret = require('../../secret')
      jwtBefore = secret.jwt
      secret.jwt = 'секретный заяц'
    })

    it('validates the token', () => {
      let obj = {prop: 123}
      let token = jwt.sign(obj, secret.jwt, {expireIn: 60 * 60})
      check.validateToken({session: {user: {token}}}).should.equal(true)
    })

    it('fails if the token is not ok', done => {
      let token = 'лживый токен'
      check.validateToken({session: {user: {token}}}).catch.should.be.ok
      check.validateToken({session: {user: {token}}}, errorText).catch(error => {
        error.should.be.equal(errorText)
        done()
      })
    })

    describe('userObjectDecode', () => {
      it('decodes the token', () => {
        let obj = {prop: 123}
        let token = jwt.sign(obj, secret.jwt, {expireIn: 60 * 60})
        check.userObjectDecode(token).should.equal(true)
      })

      it('fails if token is not ok', done => {
        let badToken = 'очень плохая музыка'
        check.userObjectDecode(badToken).catch.should.be.ok
        check.userObjectDecode(badToken, errorText).catch(error => {
          error.should.be.equal(errorText)
          done()
        })
      })
    })

    after(() => {
      secret.jwt = jwtBefore
    })
  })

  describe('checks role level', () => {
    describe('allows request if role level >= requiredRoleLevel', () => {
      check.roleLevel(STUDENT, {role: STUDENT}).should.equal(true)
      check.roleLevel(STUDENT, {role: TEACHER}).should.equal(true)
      check.roleLevel(STUDENT, {role: ADMIN}).should.equal(true)
      check.roleLevel(TEACHER, {role: TEACHER}).should.equal(true)
      check.roleLevel(TEACHER, {role: ADMIN}).should.equal(true)
      check.roleLevel(ADMIN, {role: ADMIN}).should.equal(true)
      check.roleLevel(null, null).should.equal(true)
      check.roleLevel(null, {role: STUDENT}).should.equal(true)
      check.roleLevel(null, {role: TEACHER}).should.equal(true)
      check.roleLevel(null, {role: ADMIN}).should.equal(true)
    })

    it('fails if level is below than required', done => {
      check.roleLevel(STUDENT, null).catch.should.be.ok
      check.roleLevel(STUDENT, null, errorText).catch(error => {
        error.should.equal(errorText)
        done()
      })
    })
  })

  describe('checking order', () => {
    let jwt, jwtBefore, secret
    before(() => {
      jwt = require('jsonwebtoken')
      secret = require('../../secret')
      jwtBefore = secret.jwt
      secret.jwt = 'секретный заяц'
    })

    it('if req does not exist then throws reqNotNullError', done => {
      let endpoint = access(STUDENT, () => {
      })(null)
      endpoint.catch.should.be.ok
      endpoint.catch(error => {
        error.should.equal(errors.reqNotNull)
        done()
      })
    })

    it(`if session doesn't exist then throws session error`, done => {
      let endpoint = access(STUDENT)({})
      endpoint.catch.should.be.ok
      endpoint.catch(error => {
        error.should.equal(errors.session)
        done()
      })
    })

    it(`if user doesn't exist then throws user error`, done => {
      let endpoint = access(STUDENT)({session: {}})
      endpoint.catch.should.be.ok
      endpoint.catch(error => {
        error.should.equal(errors.user)
        done()
      })
    })

    it(`if token doesn't exist then throws token error`, done => {
      let endpoint = access(STUDENT)({session: {user: {}}})
      endpoint.catch.should.be.ok
      endpoint.catch(error => {
        error.should.equal(errors.token)
        done()
      })
    })

    it(`checking if token is valid`, done => {
      let badToken = 'очень плохая музыка'
      let endpoint = access(STUDENT)({session: {user: {token: badToken}}})
      endpoint.catch.should.be.ok
      endpoint.catch(error => {
        error.should.equal(errors.validateToken)
        done()
      })
    })

    it(`checks rights`, done => {
      let user = {
        username: 'stud1',
        hashedPassword: '22112',
        role: 'student'
      }
      let token = jwt.sign(user, secret.jwt, {expireIn: 60 * 60})
      let endpoint = access(TEACHER)({session: {user: {token}}})
      endpoint.catch.should.be.ok
      endpoint.catch(error => {
        error.should.equal(errors.roleLevel)
        done()
      })
    })

    it(`runs callback if everything is cool`, done => {
      let user = {
        username: 'stud1',
        hashedPassword: '22112',
        role: 'student'
      }
      let token = jwt.sign(user, secret.jwt, {expireIn: 60 * 60})
      let endpoint = access(STUDENT, () => done())({session: {user: {token}}})
    })

    it('runs callback if rights are not required', done => {
      access(null, () => done())()
    })

    after(() => {
      secret.jwt = jwtBefore
    })
  })

  it('allows guests if required rights equal 0', done => access(null, done)(null))
})
