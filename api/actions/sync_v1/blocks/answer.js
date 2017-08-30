import { access } from '../../../utils/access'
import { STUDENT } from '../../../utils/roleLevels'
import { ActiveLecture } from '../../../models/activeLecture'
import { ActiveQuestion } from '../../../models/activeQuestion'
import { ActiveQuestionBlock } from '../../../models/activeQuestionBlock'
import { QuestionBlock } from '../../../models/questionBlock'
import { Question } from '../../../models/question'
import { io } from '../../../api'

export let errors = {
  noLectureId: 'id лекции не отправлен',
  noBlockId: 'id блока не отправлен',
  lectureNotFound: id => `activeLecture id: (${id}) не найдена`,
  blockNotFound: id => `questionBlock id: (${id}) не найден`,
  notEnoughRights: 'Недостаточно прав для совершения действия',
  noQuestionId: 'id вопроса не отправлен',
  questionNotFound: id => `question id: (${id}) не найден`,
  noAnswer: 'answer не отправлен',
  questionIsNotInBlock: (questionId, blockId) => `question id: (${questionId}) не входит в блок (${blockId})`,
}


export let query = async ({ body: { activeLectureId, blockId, questionId, answer } }, res, user) => {
  if (!activeLectureId) {
    return Promise.reject(errors.noLectureId)
  }

  if(!blockId) {
    return Promise.reject(errors.noBlockId)
  }

  if (!answer) {
    return Promise.reject(errors.noAnswer)
  }

  let activeLecture = await ActiveLecture.findOne({ _id: activeLectureId }).exec()
  if (!activeLecture) {
    return Promise.reject(errors.lectureNotFound(activeLectureId))
  }

  let activeBlock = await ActiveQuestionBlock.findOne({
      questionBlock: blockId,
      activeLecture: activeLectureId,
      ended: false,
    })
    .populate({
      path: 'activeQuestions', 
      select: '_id question activeLecture creator userAnswers',
      populate: {
        path: 'question',
      },
    })
    .exec()

  if (!activeBlock) {
    return Promise.reject(errors.blockNotFound(blockId))
  }

  if (!questionId) {
    return Promise.reject(errors.noQuestionId)
  }

  let question = await Question.findOne({ _id: questionId }).exec()
  if (!question) {
    return Promise.reject(errors.questionNotFound(questionId))
  }

  let activeQuestion = activeBlock.activeQuestions.filter(it => it.question._id.toString() === questionId)[0]
  
  let userAnswer = activeQuestion.userAnswers.filter(ans => ans.user.toString() === user._id)[0]
  if (userAnswer) {
    return activeBlock
  }

  answer.sort((a, b) => a - b)
  activeQuestion.userAnswers.push({
    user: user._id,
    answer
  })

  await activeQuestion.save()

  return activeBlock
}

export default access(STUDENT, query)
