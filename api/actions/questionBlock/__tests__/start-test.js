import { expect } from 'chai'

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

import {query as questionBlockStartQuery, errors} from '../start'

describe('questionBlock start', () => {
  let admin
  let questions
  let questionBlock
  let activeLecture
  let lecture
  
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

      done()
    })
  })

  it('rejects if activeLectureId is not defined', done => {
    let result = questionBlockStartQuery({body: {}})
    
    result
      .then(data => done(new Error(data)))
      .catch(error => {
        try {
          expect(error).to.equal(errors.activeLectureIdIsNotDefined)
          done()
        } catch (err) {
          done(new Error(err))
        }
      })
  })

  it('rejects if questionBlockId is not defined', done => {
    let result = questionBlockStartQuery({body: {
      activeLectureId: '1'
    }})
    
    result
      .then(data => done(new Error(data)))
      .catch(error => {
        try {
          expect(error).to.equal(errors.questionBlockIdIsNotDefined)
          done()
        } catch (err) {
          done(new Error(err))
        }
      })
  })

  it('rejects if activeLecture not found', () => {
    let activeLectureId = '56d985a4c73e305982b70144'
    let result = questionBlockStartQuery({body: {activeLectureId, questionBlockId: '1'}})

    return result
      .then(() => Promise.reject())
      .catch(error => {
        expect(error).to.equal(errors.activeLectureNotFound(activeLectureId))
      })
  })

  it('rejects if questionBlock not found', () => {
    let questionBlockId = '56d985a4c73e305982b70144'
    let activeLectureId = activeLecture.id
    let result = questionBlockStartQuery({body: {activeLectureId, questionBlockId}})
    return result
      .then(() => Promise.reject())
      .catch(error => {
        expect(error).to.equal(errors.questionBlockNotFound(questionBlockId))
      })
  })

  it('starts all its questions', () => {
    let questionBlockId = questionBlock.id
    let activeLectureId = activeLecture.id
    let response = {}

    return questionBlockStartQuery({body: {activeLectureId, questionBlockId}}, response, admin)
      .then(() => ActiveQuestion.find({}))
      .then(activeQuestions => {
        expect(activeQuestions).to.be.ok // eslint-disable-line
        expect(activeQuestions).to.be.an('array')
        expect(activeQuestions.length).to.equal(questions.length)
        expect(activeQuestions[0].ended).to.equal(false)
      })
  })

  it('makes a record to the db', () => {
    let questionBlockId = questionBlock.id
    let activeLectureId = activeLecture.id
    let response = {}

    return questionBlockStartQuery({body: {activeLectureId, questionBlockId}}, response, admin)
      .then(() => ActiveQuestionBlock.find({}))
      .then(activeQuestions => {
        expect(activeQuestions).to.be.ok // eslint-disable-line
        expect(activeQuestions).to.be.an('array')
        expect(activeQuestions.length).to.equal(1)
      })
  })

  it('starts', () => {
    let questionBlockId = questionBlock.id
    let activeLectureId = activeLecture.id
    let response = {}

    return questionBlockStartQuery({body: {activeLectureId, questionBlockId}}, response, admin)
      .then(activeQuestionBlock => {
        expect(activeQuestionBlock).to.be.ok // eslint-disable-line
        expect(activeQuestionBlock).to.be.an('object')
        
        expect(activeQuestionBlock.activeQuestions).to.be.an('array')
        expect(activeQuestionBlock.activeQuestions.length).to.equal(questions.length)

        expect(activeQuestionBlock.speaker).to.be.ok // eslint-disable-line
        expect(activeQuestionBlock.speaker.toString()).to.equal(admin.id)

        expect(activeQuestionBlock.activeLecture).to.be.ok // eslint-disable-line
        expect(activeQuestionBlock.activeLecture.toString()).to.equal(activeLecture.id)

        expect(activeQuestionBlock.questionBlock).to.be.ok // eslint-disable-line
        expect(activeQuestionBlock.questionBlock.toString()).to.equal(questionBlock.id)
      })
  })

  after(done => clearDB(done))
})
