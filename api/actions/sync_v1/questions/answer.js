import { access } from '../../../utils/access'
import { STUDENT } from '../../../utils/roleLevels'
import { ActiveQuestion } from '../../../models/activeQuestion'
import { Question } from '../../../models/question'

export let errors = {
  noQuestionId: 'id вопроса не отправлен',
  questionNotFound: id => `question id: (${id}) не найден`,
  noActiveLectureId: 'activeLectureId не отправлен',
  noAnswer: 'answer не отправлен',
}


export let query = async ({ body: { questionId, activeLectureId, answer } }, res, user) => {  
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
    question: questionId,
    activeLecture: activeLectureId,
    ended: false,
    block: false,
  }).exec()

  let userAnswer = activeQuestion.userAnswers.filter(ans => ans.user.toString() === user._id)[0]
  if (userAnswer) {
    return { activeQuestion }
  }

  answer.sort((a, b) => a - b)
  activeQuestion.userAnswers.push({
    user: user._id,
    answer
  })

  await activeQuestion.save()

  let stats = {
    votes: question.answers.map(() => 0),
    currentUserAnswer: answer,
    didCurrentUserAnswer: true,
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

  return {
    activeQuestion,
    stats,
  }
}

export default access(STUDENT, query)
