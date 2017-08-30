import {Schema} from 'mongoose'

let ActiveQuestionBlockSchema = new Schema({
  speaker: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activeLecture: {
    type: Schema.Types.ObjectId,
    ref: 'ActiveLecture',
    required: true
  },
  questionBlock: {
    type: Schema.Types.ObjectId,
    ref: 'QuestionBlock',
    required: true
  },
  activeQuestions: [{type: Schema.Types.ObjectId, ref: 'ActiveQuestion'}],
  ended: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    required: true,
  },
  finishedAt: {
    type: Date,
    default: null,
  },
  subscribers: [{type: Schema.Types.ObjectId, ref: 'User'}]
})

export default ActiveQuestionBlockSchema
