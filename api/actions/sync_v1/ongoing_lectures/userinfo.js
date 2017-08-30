import { access } from '../../../utils/access'
import { ActiveLecture } from '../../../models/activeLecture'
import { ActiveQuestion } from '../../../models/activeQuestion'
import { ActiveQuestionBlock } from '../../../models/activeQuestionBlock'
import { Question } from '../../../models/question'
import { STUDENT } from '../../../utils/roleLevels'
import { blockResults, blockResultsForStudent } from '../_helpers/block_results'

let cloneDeep = require('lodash/cloneDeep')
let isEqual = require('lodash/isEqual')

export let errors = {
  noId: 'id лекции не отправлен',
  notFound: id => `activeLecture id: (${id}) не найдена`,
}


/** 
 * Возвращает для текущего пользователя информацию об активных компонентах для активной лекции 
 * по activeLectureId. 
 * @returns { questionAnswers }, где questionAnswers - объект с ключами questionId
 * Каждый объект в questionAnswers описывается сигнатурой:
 * {
 *   stats: { votes: [Number] }. Каждый элемент массива votes показывает, сколько голосов было 
 *      отдано за соответсвующий вариант ответа.
 *  
 *   answer: [Number] - ответ, который дал пользователь
 * 
 *   questionId: String - id вопроса, на который отвечал пользователь
 * 
 *   correctAnswers: [Number] - правильные ответы на вопроса
 * 
 *   activeQuestionId: String - id активного вопроса, на который отвечал пользователь
 * 
 *   didCurrentUserAnswer: boolean - отвечал ли пользователь на вопрос. 
 * 
 *   userAnsweredCorrectly: boolean - ответил ли пользователь правильно. Важно заметить, что 
 *      значение false всего лишь означает, что пользователь не ответил правильно. Это значит, что 
 *      либо его ответ был неверным, либо он ответ не дал.
 * }
 */
export let query = async ({ body: { activeLectureId } }, res, user) => {
  if (!activeLectureId) {
    return Promise.reject(errors.noId)
  }

  let activeLecture = await ActiveLecture.findOne({ _id: activeLectureId }).exec()
  if (!activeLecture) {
    return Promise.reject(errors.notFound(activeLectureId))
  }

  let activeQuestions = await ActiveQuestion
    .find({ activeLecture: activeLectureId })
    .exec()

  let dic = {}  
  let lastActiveQuestions = []
  activeQuestions.forEach((activeQuestion) => {
    let questionId = activeQuestion.question
    if (!dic.hasOwnProperty(questionId)) {
      dic[questionId] = lastActiveQuestions.length
      lastActiveQuestions.push({ _id: questionId, activeQuestion })
      return
    }

    let inArray = lastActiveQuestions[dic[questionId]].activeQuestion
    let inArrayStart = new Date(inArray.startedAt).getTime()
    let notInArrayStart = new Date(activeQuestion.startedAt).getTime()
    if (notInArrayStart > inArrayStart) {
      lastActiveQuestions[dic[questionId]].activeQuestion = activeQuestion
    }
  })

  let promises = []
  for (let item of lastActiveQuestions) {
    let { activeQuestion } = item
    let promise = Question.findOne({ _id: activeQuestion.question }).exec()
    promise.then((data) => {
      activeQuestion.question = data
      return data
    })
    promises.push(promise)
  }

  await Promise.all(promises)

  // собирать здесь информацию для текущего юзера
  
  let questionAnswers = {}

  lastActiveQuestions.forEach(({ _id: questionId, activeQuestion }) => {
    let correctAnswers = cloneDeep(activeQuestion.question.correctAnswers).sort((a, b) => a - b)

    let stats = {
      votes: activeQuestion.question.answers.map(() => 0),
    }

    activeQuestion.userAnswers.forEach(({ answer }) => {
      answer.forEach(ans => stats.votes[ans]++)
    })

    let answer = activeQuestion.userAnswers.filter(it => it.user.toString() === user._id)[0]
    answer = answer ? answer.answer : null
    if (answer) {
      answer = answer.sort((a, b) => a - b)
    }

    let answerInfo = {
      stats,
      answer,
      questionId,
      correctAnswers,
      ended: activeQuestion.ended,
      activeQuestionId: activeQuestion._id,
      didCurrentUserAnswer: !!answer,
      userAnsweredCorrectly: isEqual(correctAnswers, answer),
    }

    questionAnswers[questionId] = answerInfo
  })
  
  
  let activeBlocks = await ActiveQuestionBlock
    .find({ activeLecture: activeLectureId })
    .exec()

  dic = {}
  let lastActiveBlocks = []
  activeBlocks.forEach((activeBlock) => {
    let blockId = activeBlock.questionBlock
    if (!dic.hasOwnProperty(blockId)) {
      dic[blockId] = lastActiveBlocks.length
      lastActiveBlocks.push({ _id: blockId, activeBlock })
      return
    }

    let inArray = lastActiveBlocks[dic[blockId]].activeBlock
    let inArrayStart = new Date(inArray.startedAt).getTime()
    let notInArrayStart = new Date(activeBlock.startedAt).getTime()
    if (notInArrayStart > inArrayStart) {
      lastActiveBlocks[dic[blockId]].activeBlock = activeBlock
    }
  })

  promises = []
  for (let item of lastActiveBlocks) {
    let { activeBlock } = item
    activeBlock.activeQuestions.forEach((activeQuestionId, index) => {
      let promise = ActiveQuestion.findOne(
        { _id: activeQuestionId, block: true, })
        .exec()
      promise.then((data) => {
        activeBlock.activeQuestions[index] = data
        return data
      })
      promises.push(promise)
    })
  }

  await Promise.all(promises)

  let blocks = {}

  promises = []
  lastActiveBlocks.forEach(({ _id: blockId, activeBlock }) => {
    let blockInfo = {
      blockId,
      ended: activeBlock.ended,
      activeBlockId: activeBlock._id,
    }

    let results
    if (activeLecture.speaker.toString() === user._id.toString()) {
      results = blockResults(activeBlock._id)  
    } else {
      results = blockResultsForStudent(activeBlock._id, user._id.toString())
    }

    promises.push(results)
    results.then(data => blockInfo.results = data)

    blocks[blockId] = blockInfo
  })

  await Promise.all(promises)

  return {
    questionAnswers,
    blocks,
  }
}

export default access(STUDENT, query)
