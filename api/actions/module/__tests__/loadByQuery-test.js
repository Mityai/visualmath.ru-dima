let dbURI = 'mongodb://localhost/test'
import mongooseConfig from '../../../config.js'
mongooseConfig.mongoose.uri = dbURI
let mongoose = require('../../../db')(mongooseConfig)
let clearDB = require('mocha-mongoose')(dbURI)
import {expect} from 'chai'

import loadByQuery, {query} from '../loadByQuery'

describe('module/loadByQuery', () => {
  before(done => {
    if (mongoose.connection.db) return done()

    mongoose.connect(dbURI, done)
  })


  it('returns module by full name', mochaAsync(async () => {
    let user = await userStudent()
    let module1 = await modulesFactory('name', user._id)

    let modules = await query({body: {query: {name: module1.name}}})
    modules.should.be.ok
    modules.should.be.an('array')
    modules.length.should.equal(1)
    modules[0].name.should.equal(module1.name)
  }))

  it('returns several modules on part name', mochaAsync(async () => {
    let user = await userStudent()
    let module1 = await modulesFactory('module_1', user._id)
    let module2 = await modulesFactory('module_2', user._id)
    let modules = await query({body: {query: {name: 'modu'}}})
    modules.should.be.ok
    modules.should.be.an('array')
    modules.length.should.equal(2)
    modules[0].name.should.not.equal(modules[1].name)
    if (modules[0].name === module1.name) {
      modules[0].name.should.equal(module1.name)
      modules[1].name.should.equal(module2.name)
    } else {
      modules[1].name.should.equal(module1.name)
      modules[0].name.should.equal(module2.name)
    }
  }))

  it('must be with author', mochaAsync(async () => {
    let user = await userStudent()
    let module1 = await modulesFactory('authority', user._id)

    let modules = await query({body: {query: {name: 'au'}}})
    modules.should.be.ok
    modules[0].author.should.be.ok
    modules[0].author._id.should.deep.equal(user._id)
    expect(modules[0].hashedPassword).to.be.not.ok
  }))

  it('fails on wrong id', mochaReject(async () => {
    await moduleLoadQuery({body: {id: 'bad id'}})
  }))

  after(done => clearDB(done))
})
