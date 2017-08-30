let mong = require('../db')(require('../config'))
import VisualModuleSchema from './schemas/visualModule'

let Model = mong.model.bind(mong)
export let VisualModule = Model('VisualModule', VisualModuleSchema)
