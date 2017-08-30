import {Schema} from 'mongoose'

let ModuleSchema = new Schema({
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
  content: {
    type: String
  },
  lectures: [{type: Schema.Types.ObjectId, ref: 'Lecture'}],
  hidden: {
    type: Boolean,
    default: false
  },
  visualModule: {
    type: Object
  },
  images: [{
    type: String
  }],
  imagesLeft: [{
    type: Number,
    default: 0
  }],
  imagesTop: [{
    type: Number,
    default: 0
  }],
  imagesScale: [{
    type: Number,
    default: 400
  }]
})

export default ModuleSchema
