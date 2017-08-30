let dbURI = 'mongodb://localhost/test'
import mongooseConfig from '../../../config.js'
mongooseConfig.mongoose.uri = dbURI
let mongoose = require('../../../db')(mongooseConfig)
let clearDB = require('mocha-mongoose')(dbURI)
import {expect} from 'chai'

import moduleLoad, {query as moduleLoadQuery} from '../load'

describe('list module', () => {
  before(done => {
    if (mongoose.connection.db) return done()

    mongoose.connect(dbURI, done)
  })


  it('returns module by id', mochaAsync(async () => {
    let user = await userStudent()
    let moduleToSave = await modulesFactory('1', user._id)

    let module = await moduleLoadQuery({body: { id: moduleToSave._id}})
    module.should.be.ok
    module.should.have.property('name')
    module.name.should.equal('1')

    module.should.have.property('author')
    module.author.should.be.an('object')
    expect(module.author.hashedPassword).to.be.not.ok
  }))

  it('fails on wrong id', mochaReject(async () => {
    await moduleLoadQuery({body: {id: 'bad id'}})
  }))

  after(done => clearDB(done))
})
