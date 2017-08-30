let dbURI = 'mongodb://localhost/test'
import mongooseConfig from '../../../config.js'
mongooseConfig.mongoose.uri = dbURI
let mongoose = require('../../../db')(mongooseConfig)
let clearDB = require('mocha-mongoose')(dbURI)
let User = mongoose.model('User', require('../../../models/schemas/user'))
let should = require('chai').should()

import userLoad, {query as userLoadQuery} from '../load'

describe('user', () => {
  beforeEach(done => {
    if (mongoose.connection.db) return done()

    mongoose.connect(dbURI, done)
  })

  it('load', done => {
    new User({username: 'student', password: '123456'})
      .save((err, user) => {
        userLoadQuery({body: {id: user._id}})
          .then(user => {
            user.should.be.ok
            user.should.have.property('hashedPassword')
            user.should.have.property('username')
            user.username.should.equal('student')
            done()
          })
          .catch(err => {
            throw err;
          })
      })
  })

  it('on bad id', done => {
    userLoadQuery({body: {id: 'bad id'}}).catch(error => done())
  })

  after(done => clearDB(done))
})
