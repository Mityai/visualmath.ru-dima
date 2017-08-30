import { access } from '../../../utils/access'
import { ActiveLecture } from '../../../models/activeLecture'
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

  return activeLecture
}

export default access(STUDENT, query)
