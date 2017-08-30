let mong = require('../db')(require('../config'))
import LectureSchema from './schemas/lecture'

let Model = mong.model.bind(mong)
export let Lecture = Model('Lecture', LectureSchema)
