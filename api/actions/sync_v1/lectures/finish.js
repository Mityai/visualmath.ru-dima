import { access } from '../../../utils/access'
import { ActiveLecture } from '../../../models/activeLecture'
import { TEACHER, ADMIN } from '../../../utils/roleLevels'
import { io } from '../../../api'

export let errors = {
  noId: 'id лекции не отправлен',
  notFound: id => `activeLecture id: (${id}) не найдена`,
  notEnoughRights: 'Недостаточно прав для совершения действия',
}

export let query = async ({ body: { activeLectureId } }, res, user) => {
  if (!activeLectureId) {
    return Promise.reject(new Error(errors.noId))
  }

  let activeLecture = await ActiveLecture.findOne({ _id: activeLectureId }).exec()

  if (!activeLecture) {
    return Promise.reject(errors.notFound(activeLectureId))
  }

  if (user.role !== ADMIN && user._id !== activeLecture.speaker.toString()) {
    return Promise.reject(errors.notEnoughRights)
  }

  activeLecture.ended = true
  await activeLecture.save()

  let shortLecture = {
    ongoingId: activeLecture._id,
    author: user._id,
  }

  io.emit(`sync_v1/lectures`, {
    type: 'LECTURE_FINISH', 
    shortLecture,
  })

  io.emit(`sync_v1/lectures/finish:${activeLectureId}`)

  return activeLecture
}

export default access(TEACHER, query)
