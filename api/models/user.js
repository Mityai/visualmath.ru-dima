let mong = require('../db')(require('../config'))
import UserSchema from './schemas/user'

let Model = mong.model.bind(mong)
export let User = Model('User', UserSchema)
