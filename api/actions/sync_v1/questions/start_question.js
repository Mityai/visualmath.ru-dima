import { access } from '../../../utils/access'
import { TEACHER } from '../../../utils/roleLevels'
import { ActiveLecture } from '../../../models/activeLecture'
import { ActiveQuestion } from '../../../models/activeQuestion'
import { Question } from '../../../models/question'
import { io } from '../../../api'

export let errors = {
  noLectureId: 'id лекции не отправлен',
  noQuestionId: 'id вопроса не отправлен',
  lectureNotFound: id => `activeLecture id: (${id}) не найдена`,
  questionNotFound: id => `question id: (${id}) не найден`,
  notEnoughRights: 'Недостаточно прав для совершения действия',
}


export let query = async ({ body: { activeLectureId, questionId } }, res, user) => {
  console.log(activeLectureId, questionId)

  if (!activeLectureId) {
    return Promise.reject(errors.noLectureId)
  }

  if(!questionId) {
    return Promise.reject(errors.noQuestionId)
  }

  let activeLecture = await ActiveLecture.findOne({ _id: activeLectureId }).exec()
  if (!activeLecture) {
    return Promise.reject(errors.lectureNotFound(activeLectureId))
  }

  if (activeLecture.speaker.toString() !== user._id) {
    return Promise.reject(errors.notEnoughRights)
  }

  let question = await Question.findOne({ _id: questionId }).exec()
  if (!question) {
    return Promise.reject(errors.questionNotFound(questionId))
  }

  let activeQuestionData = {
    creator: user._id,
    activeLecture: activeLecture._id,
    question: question._id,
    block: false,
  }

  let activeQuestion
  activeQuestion = await ActiveQuestion.findOne(Object.assign({ ended: false },  activeQuestionData)).exec()
  if (activeQuestion) {
    return activeQuestion
  }

  activeQuestion = new ActiveQuestion(activeQuestionData)
  await activeQuestion.save()

  activeQuestion = {
    creator: activeQuestion.creator,
    activeLecture: activeQuestion.activeLecture,
    question: activeQuestion.question,
    _id: activeQuestion._id,
    ended: activeQuestion.ended,
  }

  io.emit(`sync_v1/questions:${activeLectureId}:${questionId}`, {
    type: 'QUESTION_START',
    activeQuestion,
    activeLectureId,
    questionId,
  })

  return activeQuestion
}

export default access(TEACHER, query)
