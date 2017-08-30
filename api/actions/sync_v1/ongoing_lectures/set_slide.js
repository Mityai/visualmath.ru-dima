import { access } from '../../../utils/access'
import { TEACHER } from '../../../utils/roleLevels'
import { ActiveLecture } from '../../../models/activeLecture'
import { Lecture } from '../../../models/lecture'
import { query as loadSlide } from './load_slide'
import { io } from '../../../api'

export let errors = {
  noId: 'id лекции не отправлен',
  noSlideNumber: 'slideNumber не отправлен',
  notFound: id => `activeLecture id: (${id}) не найдена`,
  notEnoughRights: 'Недостаточно прав для совершения действия',
  badSlideNumber: 'некорректный номер слайда',
}


export let query = async ({ body: { activeLectureId, slideNumber } }, res, user) => {
  if (!activeLectureId) {
    return Promise.reject(errors.noId)
  }

  if (slideNumber === undefined) {
    return Promise.reject(errors.noSlideNumber)
  }

  if (slideNumber < 0) {
    return Promise.reject(errors.badSlideNumber)
  }

  let activeLecture = await ActiveLecture.findOne({ _id: activeLectureId }).exec()
  if (!activeLecture) {
    return Promise.reject(errors.notFound(activeLectureId))
  }

  if (activeLecture.speaker.toString() !== user._id) {
    return Promise.reject(errors.notEnoughRights)
  }

  let lecture = await Lecture.findOne({ _id: activeLecture.lecture }).exec()
  if (lecture.mapping.length <= slideNumber) {
    return Promise.reject(errors.badSlideNumber)
  }

  activeLecture.ongoingModule = slideNumber
  await activeLecture.save()

  let slide = await loadSlide({ body: { activeLectureId } }, res, user)
  
  io.emit(`sync_v1/ongoing_lectures/set_slide:${activeLectureId}`, slide)

  return slide
}

export default access(TEACHER, query)
