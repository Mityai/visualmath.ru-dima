import { Schema } from 'mongoose'

let ActiveLectureSchema = new Schema({
  speaker: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lecture: {
    type: Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true,
  },
  ongoingModule: {
    type: Number,
    default: 0,
  },
  ended: {
    type: Boolean,
    default: false,
  },
  activeQuestionBlocks: [{type: Schema.Types.ObjectId, ref: 'ActiveQuestionBlock'}],
  subscribers: [{type: Schema.Types.ObjectId, ref: 'User'}],
  created: {
    type: Date,
    default: Date.now,
  },
})

export default ActiveLectureSchema
