let mong = require('../db')(require('../config'))
import ModuleSchema from './schemas/module'

let Model = mong.model.bind(mong)
export let Module = Model('Module', ModuleSchema)
