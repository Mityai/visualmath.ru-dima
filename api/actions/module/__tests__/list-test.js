let dbURI = 'mongodb://localhost/test'
import mongooseConfig from '../../../config.js'
mongooseConfig.mongoose.uri = dbURI
let mongoose = require('../../../db')(mongooseConfig)
let clearDB = require('mocha-mongoose')(dbURI)

import moduleList, {query as moduleListQuery, errors} from '../list'

describe('list module', () => {
  before(done => {
    if (mongoose.connection.db) return done()

    mongoose.connect(dbURI, done)
  })

  it('returns empty list', mochaAsync(async () => {
    let modules = await moduleListQuery()
    modules.should.be.ok
    modules.should.be.an('array')
    modules.length.should.equal(0)
  }))

  it('returns list of all modules', mochaAsync(async () => {
    let user = await userStudent()
    let module1 = await modulesFactory('1', user._id)
    let module2 = await modulesFactory('2', user._id)

    let modules = await moduleListQuery()
    modules.should.be.ok
    modules.should.be.an('array')
    modules.length.should.equal(2)

    modules[0].should.have.property('name')
    modules[0].name.should.equal('1')

    modules[1].should.have.property('name')
    modules[1].name.should.equal('2')
  }))

  after(done => clearDB(done))
})
