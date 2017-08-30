let mong = require('../db')(require('../config'))
import ActiveLectureInfoSchema from './schemas/activeLectureInfo'

let Model = mong.model.bind(mong)
export let ActiveLectureInfo = Model('ActiveLectureInfo', ActiveLectureInfoSchema)
