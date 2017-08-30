import { Schema } from 'mongoose'

let ShortLectureSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lecture: {
    type: Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  isOngoing: {
    type: Boolean,
    required: true,
  },
  ongoingId: {
    type: String,
    required: true,
  },
  isSpeaker: {
    type: Boolean,
    required: true,
  }
})

export default ShortLectureSchema