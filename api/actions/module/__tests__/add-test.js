let dbURI = 'mongodb://localhost/test'
import mongooseConfig from '../../../config.js'
mongooseConfig.mongoose.uri = dbURI
let mongoose = require('../../../db')(mongooseConfig)
let clearDB = require('mocha-mongoose')(dbURI)

let Module = mongoose.model('Module', require('../../../models/schemas/module'))
let User = mongoose.model('User', require('../../../models/schemas/user'))

import moduleAdd, {query as moduleAddQuery, errors} from '../add'

describe('module add', () => {
  before(done => {
    if (mongoose.connection.db) return done()

    mongoose.connect(dbURI, done)
  })

  it('fails if no name provided', mochaAsync(() => {
    moduleAddQuery({body: {}}).should.eventually.be.rejectedWith(errors.name)
  }))

  it('saves new module', mochaAsync(async () => {
    let user = await new User({username: 'admin', password: '123456'}).save()

    let moduleToSave = {name: 'Модуль', text: 'lalala', script: 'script'}
    let module = await moduleAddQuery({body: moduleToSave}, null, user)
    module.should.be.ok
    module.should.be.an('object')

    module.should.have.property('name')
    module.name.should.equal(moduleToSave.name)

    module.should.have.property('author')
    module.author.should.equal(user._id)

    module.should.have.property('content')
    module.content.should.equal(moduleToSave.text)

    module.should.have.property('script')
    module.script.should.equal(moduleToSave.script)
  }))

  after(done => clearDB(done))
})
