import {Schema} from 'mongoose'

let QuestionSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  question: {
    type: String,
    required: true
  },
  answers: [String],
  correctAnswers: [Number], // indices of correct answers
  multiple: {
    type: Boolean,
    required: true
  },
  difficulty: {
    type: Number,
    required: true
  },
  hidden: {
    type: Boolean,
    default: false
  }
});

export default QuestionSchema
