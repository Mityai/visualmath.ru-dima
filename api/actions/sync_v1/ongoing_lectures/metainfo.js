import { access } from '../../../utils/access'
import { Lecture } from '../../../models/lecture'
import { ActiveLecture } from '../../../models/activeLecture'
import { ActiveLectureInfo } from '../../../models/activeLectureInfo'
import { STUDENT } from '../../../utils/roleLevels'

export let errors = {
  noId: 'id лекции не отправлен',
  notFound: id => `activeLecture id: (${id}) не найдена`,
}

export let query = async ({ body: { activeLectureId } }, res, user) => {
  if (!activeLectureId) {
    return Promise.reject(errors.noId)
  }

  let activeLecture = await ActiveLecture.findOne({ _id: activeLectureId }).exec()
  if (!activeLecture) {
    return Promise.reject(errors.notFound(activeLectureId))
  }

  let info = {
    speaker: activeLecture.speaker,
    ended: activeLecture.ended,
    slidesDescription: [],
  }

  let lecture = await Lecture.findOne({ _id: activeLecture.lecture })
    .populate('modules questions questionBlocks mapping')
    .exec()

  lecture.mapping.forEach(({ type, index }) => {
    if (type === 'module') {
      info.slidesDescription.push({
        type: 'slide',
        name: lecture.modules[index].name,
      })
    } else if (type === 'question') {
      info.slidesDescription.push({
        type: 'question',
        name: lecture.questions[index].question,
      })
    } else if (type === 'questionBlock') {
      info.slidesDescription.push({
        type: 'questionBlock',
        name: lecture.questionBlocks[index].name,
      })
    }
  })

  info.slidesNumber = lecture.mapping.length

  let activeLectureInfo = new ActiveLectureInfo(info)
  return activeLectureInfo
}

export default access(STUDENT, query)
