import { Lecture } from '../../../models/lecture'
import { ActiveLecture } from '../../../models/activeLecture'
import { ShortLecture } from '../../../models/shortLecture'
import { access } from '../../../utils/access'

// todo: Отдавать только основную информацию: id, имя, автор и тд.

export default access(
  'student',
  async ({ body: { ongoing } }, res, user) => {
    let lectures
    try {    
      lectures = await Lecture.find({ hidden: false }, 'name _id created').exec()
    } catch (err) {
      console.error(err)
      return Promise.reject(err)
    }

    let activeLectureQuery = {
      ended: false,
      lecture: {
        $in: lectures.map(it => it._id)
      }
    }

    let activeLectures = await ActiveLecture.find(activeLectureQuery)
      .populate('speaker', 'username _id role first_name last_name')
      .exec()

    let activeLectureIds = activeLectures.map(it => it.lecture.toString())

    let shortLectures = []

    lectures.forEach((lecture) => {
      let index = activeLectureIds.indexOf(lecture._id.toString())
      let isOngoing = index !== -1
      if (!isOngoing) return

      let ongoingId = activeLectures[index]._id.toString()
      let isSpeaker = user._id === activeLectures[index].speaker._id.toString()
      let speaker = activeLectures[index].speaker

      shortLectures.push(new ShortLecture({
        ongoingId,
        isSpeaker,
        isOngoing: true,
        lecture: lecture._id.toString(),
        name: lecture.name,
        author: speaker,
        created: lecture.created,
      }))
    })

    return shortLectures
  }
)
