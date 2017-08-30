let mong = require('../db')(require('../config'))
import ShortLectureSchema from './schemas/shortLecture'

let Model = mong.model.bind(mong)
export let ShortLecture = Model('ShortLecture', ShortLectureSchema)
