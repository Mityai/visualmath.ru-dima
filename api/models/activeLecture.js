let mong = require('../db')(require('../config'))
import ActiveLectureSchema from './schemas/activeLecture'

let Model = mong.model.bind(mong)
export let ActiveLecture = Model('ActiveLecture', ActiveLectureSchema)
