import { Schema } from 'mongoose'

let _SlideDescription = new Schema({
  type: {
    type: String,
    enum: ['slide', 'visual', 'question', 'questionBlock'],
  },
  name: {
    type: String,
    required: true,
  },
})

let ActiveLectureInfoSchema = new Schema({
  speaker: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ended: {
    type: Boolean,
    default: false
  },
  slidesDescription: [_SlideDescription],
  slidesNumber: {
    type: Number,
    required: true,
  }
})

export default ActiveLectureInfoSchema
