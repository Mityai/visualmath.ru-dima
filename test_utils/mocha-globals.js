let chai = require('chai')
chai.should()
chai.use(require('chai-as-promised'))
require('babel-runtime/core-js/promise').default = require('bluebird')

require('./mongooseModules')

require('./userFactory')
require('./modulesFactory')

let config = require('../api/config')
config.mongoose.uri = 'mongodb://localhost/test'


let mochaAsync = fn => {
  return async done => {
    try {
      await fn()
      done()
    } catch (err) {
      done(err)
    }
  }
}

let mochaReject = fn => {
  return async done => {
    try {
      await fn()
      done(new Error('must be rejected'))
    } catch (err) {
      done()
    }
  }
}

global.dbURI = 'mongodb://localhost/test'
global.mochaAsync = mochaAsync
global.mochaReject = mochaReject
