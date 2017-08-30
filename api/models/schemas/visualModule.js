import {Schema} from 'mongoose'

let VisualModuleSchema = new Schema({
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
  description: {
    type: String,
    required: true,
  },
  // hidden: {
  //   type: Boolean,
  //   default: false
  // },
  script: {
    type: String,
    required: true,
  }
})

export default VisualModuleSchema
