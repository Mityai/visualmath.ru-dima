import {expect} from 'chai'

let dbURI = 'mongodb://localhost/test'
import mongooseConfig from '../../../config.js'
mongooseConfig.mongoose.uri = dbURI
let mongoose = require('../../../db')(mongooseConfig)
let clearDB = require('mocha-mongoose')(dbURI)

let QuestionBlock = mongoose.model('QuestionBlock', require('../../../models/schemas/questionBlock'))
let User = mongoose.model('User', require('../../../models/schemas/user'))
let Question = mongoose.model('Question', require('../../../models/schemas/question'))

import questionBlockLoad, {query as questionBlockLoadQuery, errors} from '../load'

describe('questionBlock add', () => {
  let admin
  let questions
  let questionBlock
  
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

      questionBlock = await new QuestionBlock({
        questionsIds: questions.map(it => it._id),
        author: admin._id
      }).save()

      done()
    })
  })

  it('rejects if id is not defined', done => {
    let result = questionBlockLoadQuery({body: {}})
    
    result
      .then(data => done(new Error(data)))
      .catch(error => {
        try {
          expect(error).to.equal(errors.idIsNotDefined)
          done()
        } catch (err) {
          done(new Error(err))
        }
      })
  })

  it('loads questionBlock', mochaAsync(async () => {
    let result = await questionBlockLoadQuery({body: {id: questionBlock.id}})

    expect(result).to.be.an('object')
    expect(result).to.have.property('questionsIds')
    expect(result.questionsIds).to.be.an('array')
    expect(result._id).to.deep.equal(questionBlock._id)
  }))

  after(done => clearDB(done))
})
