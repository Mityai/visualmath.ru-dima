import {Schema} from 'mongoose'

let _Mapping = new Schema({
  type: {
    type: String,
    enum: ['module', 'question', 'questionBlock']
  },
  index: Number
})

let LectureSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  modules: [{type: Schema.Types.ObjectId, ref: 'Module'}],
  questions: [{type: Schema.Types.ObjectId, ref: 'Question'}],
  questionBlocks: [{type: Schema.Types.ObjectId, ref: 'QuestionBlock'}],
  mapping: [_Mapping],
  // добавить тип ModuleOrQuestion
  // populate делать вручную
  // мигрировать имеющиеся лекции
  // добавить в client-side коде обработку ModuleOfQuestion
  hidden: {
    type: Boolean,
    default: false
  }
})

export default LectureSchema
