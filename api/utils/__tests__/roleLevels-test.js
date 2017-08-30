import {level, STUDENT, TEACHER, ADMIN} from '../roleLevels'
require('chai').should()

describe('roleLevels', () => {
  it('returns numbers', () => {
    level(ADMIN).should.be.a('number')
    level(TEACHER).should.be.a('number')
    level(STUDENT).should.be.a('number')
    level(undefined).should.be.a('number')
  })

  describe('returns correct priorities', () => {
    it('student', () => {
      level(STUDENT).should.be.above(level(undefined))
      level(STUDENT).should.be.below(level(TEACHER))
      level(STUDENT).should.be.below(level(ADMIN))
    })

    it('teacher', () => {
      level(TEACHER).should.be.above(level(undefined))
      level(TEACHER).should.be.above(level(STUDENT))
      level(TEACHER).should.be.below(level(ADMIN))
    })

    it('admin', () => {
      level(ADMIN).should.be.above(level(undefined))
      level(ADMIN).should.be.above(level(STUDENT))
      level(ADMIN).should.be.above(level(TEACHER))
    })
  })
})
