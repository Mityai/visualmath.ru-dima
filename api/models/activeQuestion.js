let mong = require('../db')(require('../config'))
import ActiveQuestionSchema from './schemas/activeQuestion'

let Model = mong.model.bind(mong)
export let ActiveQuestion = Model('ActiveQuestion', ActiveQuestionSchema)
