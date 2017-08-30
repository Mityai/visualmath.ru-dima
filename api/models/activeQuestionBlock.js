let mong = require('../db')(require('../config'))
import ActiveQuestionBlockSchema from './schemas/activeQuestionBlock'

let Model = mong.model.bind(mong)
export let ActiveQuestionBlock = Model('ActiveQuestionBlock', ActiveQuestionBlockSchema)
