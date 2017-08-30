import {expect} from 'chai'

let dbURI = 'mongodb://localhost/test'
import mongooseConfig from '../../../config.js'
mongooseConfig.mongoose.uri = dbURI
let mongoose = require('../../../db')(mongooseConfig)
let clearDB = require('mocha-mongoose')(dbURI)

let QuestionBlock = mongoose.model('QuestionBlock', require('../../../models/schemas/questionBlock'))
let User = mongoose.model('User', require('../../../models/schemas/user'))
let Question = mongoose.model('Question', require('../../../models/schemas/question'))

import questionBlockAdd, {query as questionBlockAddQuery, errors} from '../add'

describe('questionBlock add', () => {
  let admin
  let questions
  
  before(done => {
    if (mongoose.connection.db) return done()

    mongoose.connect(dbURI, done)
  })

  beforeEach(done => {
    clearDB(async () => {
      admin = await global.userAdmin()
      questions = []
      for (let i = 0; i < 5; i++) { // eslint-disable-line
        questions.push(await new Question({ 
          question: ('' + i), 
          answers: ['a', 'b', 'c'], 
          correctAnswers: [i % 3],
          multiple: false
        }).save())
      }
      done()
    })
  })

  it('rejects if questionsIds is not defined', done => {
    let result = questionBlockAddQuery({body: {}})
    result
      .then(data => {
        done(data)
      })
      .catch(error => {
        try {
          expect(error).to.equal(errors.questionsIdsNotDefined)
          done()
        } catch (error) {
          done(error)
        }
      })
  })

  it('rejects if questionsIds is empty array', done => {
    let result = questionBlockAddQuery({body: {questionsIds: []}})
    result
      .then(data => {
        done(data)
      })
      .catch(error => {
        try {
          expect(error).to.equal(errors.questionsIdsIsEmpty)
          done()
        } catch (error) {
          done(error)
        }
      })
  })

  it('rejects if any of questionsIds is wrong (questions id does not exist)', done => {
    let result = questionBlockAddQuery({body: {
      questionsIds: ['1']
    }})

    result
      .then(data => {
        done(new Error(data))
      })
      .catch(() => {
        try {
          done()
        } catch (error) {
          done(error)
        }
      })
  })

  it('creates a new questionBlock', mochaAsync(async () => {
    
    let result = await questionBlockAddQuery({
      body: {
        questionsIds: [questions[0]._id, questions[1]._id]
      }
    }, {}, admin)

    expect(result).to.be.an('object')
    expect(result).to.have.property('questionsIds')
    expect(result).to.have.property('author')

    expect(result.author).to.equal(admin._id)

    expect(result.questionsIds).to.be.an('array')
    expect(result.questionsIds.length).to.equal(2)
    expect(result.questionsIds[0]).to.equal(questions[0]._id)
    expect(result.questionsIds[1]).to.equal(questions[1]._id)
  }))

  it('saves the new question block to the db', mochaAsync(async () => {
    let result = await questionBlockAddQuery({
      body: {
        questionsIds: [questions[0]._id, questions[1]._id]
      }
    }, {}, admin)

    let saved = await QuestionBlock.findOne({_id: result._id}).exec()
    expect(saved).not.to.equal(null)
    expect(saved).to.be.an('object')
    expect(saved._id).to.deep.equal(result._id)
  }))

  after(done => clearDB(done))
})
