import { access } from '../../../utils/access'
import { Lecture } from '../../../models/lecture'
import { ActiveLecture } from '../../../models/activeLecture'
import { User } from '../../../models/user'
import { io } from '../../../api'
import { ShortLecture } from '../../../models/shortLecture'


export default access('teacher', async ({body: {id}}, res, user) => {
  if (!id) {
    return Promise.reject('id лекции не отправлен')
  }

  console.info(`lectures/start, id: (${id})`)

  let lecture = await Lecture.findOne({_id: id}).exec()
  if (!lecture) {
    return Promise.reject('lecture not found')
  }

  let query = {
    lecture: lecture._id,
    speaker: user._id,
    ended: false
  }

  let activeLecture
  activeLecture = await ActiveLecture.findOne(query).exec()
  if (!activeLecture) {
    activeLecture = new ActiveLecture({
      lecture: id,
      speaker: user._id
    })

    await activeLecture.save()
  }

  let author = await User.findOne({ _id: user._id }, 'username _id role first_name last_name').exec()

  let shortLecture = new ShortLecture({
    ongoingId: activeLecture._id,
    isSpeaker: false, // потому что принимать этот объект будут студенты
    isOngoing: true,
    lecture: id,
    name: lecture.name,
    author,
    created: lecture.created,
  })

  io.emit(`sync_v1/lectures`, {
    type: 'LECTURE_START', 
    shortLecture,
  })

  return activeLecture
})
