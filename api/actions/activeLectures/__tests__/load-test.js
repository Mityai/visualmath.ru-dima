let dbURI = 'mongodb://localhost/test'
import mongooseConfig from '../../../config.js'
mongooseConfig.mongoose.uri = dbURI
let mongoose = require('../../../db')(mongooseConfig)
let clearDB = require('mocha-mongoose')(dbURI)

let ActiveLecture = mongoose.model('ActiveLecture', require('../../../models/schemas/activeLecture'))
let Lecture = mongoose.model('Lecture', require('../../../models/schemas/Lecture'))
let User = mongoose.model('User', require('../../../models/schemas/user'))

import activeLectureLoad, {query as activeLectureLoadQuery, errors} from '../load'

describe('activeLecture', () => {
  before(done => {
    if (mongoose.connection.db) return done()

    mongoose.connect(dbURI, done)
  })

  it('load', mochaAsync(async() => {
    let user = await new User({username: 'admin', password: '123456', role: 'admin'}).save()
    let lecture = await new Lecture({author: user._id, name: 'Какая-то лекция'}).save()
    let {_id} = await new ActiveLecture({speaker: user._id, lecture: lecture._id}).save()

    let activeLecture = await activeLectureLoadQuery({body: {id: _id}})
    activeLecture.should.be.ok

    activeLecture.should.have.property('speaker')
    activeLecture.speaker.should.be.an('object')

    activeLecture.speaker.should.have.property('role')

    activeLecture.should.have.property('lecture')
    activeLecture.lecture.should.be.an('object')
  }))

  it('fail on non id', mochaReject(async () =>
    await activeLectureLoadQuery({body: {}})
  ))

  it('fail on bad id', mochaReject(async () =>
    await activeLectureLoadQuery({body: {id: '1212132'}})
  ))

  after(done => clearDB(done))
})
