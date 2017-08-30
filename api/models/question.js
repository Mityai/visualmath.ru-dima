let mong = require('../db')(require('../config'))
import QuestionSchema from './schemas/question'

let Model = mong.model.bind(mong)
export let Question = Model('Question', QuestionSchema)
