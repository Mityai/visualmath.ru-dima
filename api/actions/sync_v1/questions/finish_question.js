import { access } from '../../../utils/access'
import { TEACHER } from '../../../utils/roleLevels'
import { ActiveQuestion } from '../../../models/activeQuestion'
import { Question } from '../../../models/question'
import { io } from '../../../api'

export let errors = {
  noQuestionId: 'id вопроса не отправлен',
  questionNotFound: id => `question id: (${id}) не найден`,
  notEnoughRights: 'Недостаточно прав для совершения действия',
  noActiveLectureId: 'activeLectureId не отправлен',
}


export let query = async ({ body: { questionId, activeLectureId } }, res, user) => {
  if (!questionId) {
    return Promise.reject(errors.noQuestionId)
  }

  if (!activeLectureId) {
    return Promise.reject(errors.noActiveLectureId)
  }

  let question = await Question.findOne({ _id: questionId }).exec()
  if (!question) {
    return Promise.reject(errors.questionNotFound(questionId))
  }

  let activeQuestion = await ActiveQuestion.findOne({
    creator: user._id,
    question: questionId,
    activeLecture: activeLectureId,
    ended: false,
    block: false,
  }).exec()

  if (!activeQuestion) {
    return Promise.reject(errors.questionNotFound(questionId))
  }

  activeQuestion.ended = true
  activeQuestion.finishedAt = Date.now()
  await activeQuestion.save()

  let stats = {
    votes: question.answers.map(() => 0),
  }

  activeQuestion.userAnswers.forEach(({ answer }) => {
    answer.forEach(ans => stats.votes[ans]++)
  })

  activeQuestion = {
    creator: activeQuestion.creator,
    activeLecture: activeQuestion.activeLecture,
    question: activeQuestion.question,
    _id: activeQuestion._id,
    ended: activeQuestion.ended,
  }

  io.emit(`sync_v1/questions:${activeLectureId}:${questionId}`, {
    type: 'QUESTION_FINISH',
    activeQuestion,
    activeLectureId,
    questionId,
  })

  return {
    activeQuestion,
    stats,
  }
}

export default access(TEACHER, query)
