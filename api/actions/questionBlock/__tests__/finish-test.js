import { expect } from 'chai'
import proxyquire from 'proxyquire'

let dbURI = 'mongodb://localhost/test'
import mongooseConfig from '../../../config.js'
mongooseConfig.mongoose.uri = dbURI
let mongoose = require('../../../db')(mongooseConfig)
let clearDB = require('mocha-mongoose')(dbURI)

let QuestionBlock = mongoose.model('QuestionBlock', require('../../../models/schemas/questionBlock'))
let ActiveQuestionBlock = mongoose.model('ActiveQuestionBlock', require('../../../models/schemas/activeQuestionBlock'))
let ActiveLecture = mongoose.model('ActiveLecture', require('../../../models/schemas/activeLecture'))
let ActiveQuestion = mongoose.model('ActiveQuestion', require('../../../models/schemas/activeQuestion'))
let Lecture = mongoose.model('Lecture', require('../../../models/schemas/Lecture'))
let Question = mongoose.model('Question', require('../../../models/schemas/question'))

let module = proxyquire('../finish', {
  '../../api': {
    io: {
      emit: () => {}
    }
  }
})

let questionBlockFinishQuery = module.query 
let errors = module.errors
// import {query as questionBlockFinishQuery, errors} from '../finish'

describe('questionBlock finish', () => {
  let admin
  let questions
  let questionBlock
  let activeLecture
  let lecture
  let activeQuestionBlock
  let activeQuestions
  
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

      lecture = await new Lecture({author: admin._id, name: 'Какая-то лекция'}).save()
      activeLecture = await new ActiveLecture({speaker: admin._id, lecture: lecture._id}).save()

      let promises = questions.map(it => new ActiveQuestion({
        creator: admin.id,
        activeLecture: activeLecture.id,
        question: it.id
      }).save())

      activeQuestions = await Promise.all(promises)

      activeQuestionBlock = await new ActiveQuestionBlock({
        speaker: admin.id,
        activeLecture: activeLecture.id,
        questionBlock: questionBlock.id,
        activeQuestions: activeQuestions.map(it => it.id)
      }).save()

      done()
    })
  })

  it('rejects if activeQuestionBlockId is not defined', done => {
    let result = questionBlockFinishQuery({body: {}})
    
    result
      .then(data => done(new Error(data)))
      .catch(error => {
        try {
          expect(error).to.equal(errors.activeQuestionBlockIdIsNotDefined)
          done()
        } catch (err) {
          done(new Error(err))
        }
      })
  })

  it('rejects if activeQuestionBlock not found', () => {
    let activeQuestionBlockId = '56d985a4c73e305982b70144'
    let result = questionBlockFinishQuery({body: {activeQuestionBlockId}})

    return result
      .then(() => Promise.reject())
      .catch(error => {
        expect(error).to.equal(errors.activeQuestionBlockNotFound(activeQuestionBlockId))
      })
  })

  it('finishes all its questions', () => {
    let activeQuestionBlockId = activeQuestionBlock.id
    let response = {}

    return questionBlockFinishQuery({body: {activeQuestionBlockId}}, response, admin)
      .then(() => ActiveQuestion.find({}))
      .then(activeQuestions => {
        expect(activeQuestions).to.be.ok // eslint-disable-line
        expect(activeQuestions).to.be.an('array')
        expect(activeQuestions.length).to.equal(questions.length)
        
        let ended = true
        activeQuestions.forEach(it => ended = ended && it.ended)
        expect(ended).to.equal(true)
      })
  })

  it('ends', () => {
    let activeQuestionBlockId = activeQuestionBlock.id
    let response = {}

    return questionBlockFinishQuery({body: {activeQuestionBlockId}}, response, admin)
      .then(activeQuestionBlock => {
        expect(activeQuestionBlock).to.be.ok // eslint-disable-line
        expect(activeQuestionBlock).to.be.an('object')

        expect(activeQuestionBlock.ended).to.equal(true) 
      })
  })

  after(done => clearDB(done))
})
