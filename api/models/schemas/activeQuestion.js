import {Schema} from 'mongoose'

let activeQuestionSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activeLecture: {
    type: Schema.Types.ObjectId,
    ref: 'ActiveLecture',
    required: true
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  ended: {
    type: Boolean,
    default: false
  },
  userAnswers: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    answer: [Number]
  }],
  startedAt: {
    type: Date,
    default: Date.now,
  },
  finishedAt: {
    type: Date,
    default: null,
  },
  block: {
    type: Boolean,
    default: false,
  }
})

export default activeQuestionSchema
