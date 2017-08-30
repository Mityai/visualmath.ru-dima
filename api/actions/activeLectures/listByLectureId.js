import { ActiveLecture } from '../../models/activeLecture'
import { Lecture } from '../../models/lecture'

import { access } from '../../utils/access'
import { TEACHER } from '../../utils/roleLevels'

export let errors = {
  lectureIdIsNotDefined: 'lectureId должен быть строкой',
  lectureNotFound: id => `lecture (id: ${id}) не найдена`
}

export let query = async ({ body: { lectureId } }) => {
  console.info('activeLectures/listByLectureId')
  console.info(`activeLectureId: ${lectureId}`)

  if (!lectureId) {
    return Promise.reject(new Error(errors.lectureIdIsNotDefined))
  }

  let lecture = await Lecture.findOne({_id: lectureId}).exec()
  if (!lecture) {
    return Promise.reject(new Error(errors.lectureNotFound(lectureId)))
  }

  let activeLectures = await ActiveLecture.find({lecture: lectureId, ended: true}).exec()
  return activeLectures
}

export default access(TEACHER, query)
