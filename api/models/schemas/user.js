import crypto from 'crypto'
import {Schema} from 'mongoose'
import {passwords as secret} from '../../secret'

let UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String
  },
  vk_id:{
    type: String,
    default: ''
  },
  first_name: {
    type: String,
    default: ''
  },
  last_name: {
    type: String,
    default: ''
  },
  hashedPassword: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  university: {
    type: String,
    default: ''
  },
  group: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'student'
  },
  lectureSubscriptions: [{type: Schema.Types.ObjectId, ref: 'ActiveLecture'}]
})

function encryptPassword(password) {
  return crypto.createHmac('sha256', secret).update(password).digest('hex')
}

UserSchema.virtual('password')
  .set(function (password) {
    this.hashedPassword = encryptPassword(password)
  })

UserSchema.methods.verifyPassword = function (password) {
  return encryptPassword(password) === this.hashedPassword
}

export default UserSchema
