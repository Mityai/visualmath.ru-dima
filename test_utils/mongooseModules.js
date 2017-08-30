import mongoose from 'mongoose'

global.UserMongo = mongoose.model('User', require('../api/models/schemas/user'))
global.ModuleMongo = mongoose.model('Module', require('../api/models/schemas/module'))
