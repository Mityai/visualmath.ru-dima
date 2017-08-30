let mong = require('../db')(require('../config'))
import QuestionBlockSchema from './schemas/questionBlock'

let model = mong.model.bind(mong)
export let QuestionBlock = model('QuestionBlock', QuestionBlockSchema)
