import { ActiveQuestionBlock } from '../../models/activeQuestionBlock'
import { ActiveLecture } from '../../models/activeLecture'
import { QuestionBlock } from '../../models/questionBlock'

import { access } from '../../utils/access'
import { STUDENT } from '../../utils/roleLevels'

export let errors = {
  notFound: 'Блок не найден',
  activeLectureIdIsNotDefined: 'activeLectureId должен быть строкой',
  questionBlockIdIsNotDefined: 'questionBlockId должен быть строкой',
  activeLectureNotFound: id => `activeLecture (id: ${id}) не найдена`,
  questionBlockNotFound: id => `questionBlock (id: ${id}) не найден`
}

export let query = async ({ body: { activeLectureId, questionBlockId } }) => {
  console.info('activeQuestionBlock/load')
  console.info(`activeLectureId: ${activeLectureId}`)
  console.info(`questionBlockId: ${questionBlockId}`)

  if (typeof activeLectureId !== 'string') {
    return Promise.reject(errors.activeLectureIdIsNotDefined)
  }

  if (typeof questionBlockId !== 'string') {
    return Promise.reject(errors.questionBlockIdIsNotDefined)
  }

  let activeLecture = await ActiveLecture.findOne({_id: activeLectureId}).exec()
  if (!activeLecture) {
    return Promise.reject(errors.activeLectureNotFound(activeLectureId))
  }

  let questionBlock = await QuestionBlock.findOne({_id: questionBlockId}).exec()
  if (!questionBlock) {
    return Promise.reject(errors.activeLectureNotFound(questionBlockId))
  }

  return ActiveQuestionBlock.findOne({
    activeLecture: activeLectureId,
    questionBlock: questionBlockId
  })
    .populate('activeQuestions')
    .exec()
}

export default access(STUDENT, query)
