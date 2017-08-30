import {Schema} from 'mongoose'

let QuestionBlockSchema = new Schema({
  name: {
    type: String
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  questionsIds: [{
    type: Schema.Types.ObjectId, 
    ref: 'Question'
  }],
  hidden: {
    type: Boolean,
    default: false
  }
});

export default QuestionBlockSchema
