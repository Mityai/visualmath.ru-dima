import { ActiveQuestionBlock } from '../../../models/activeQuestionBlock'
import { User } from '../../../models/user'

let isEqual = require('lodash/isEqual')

export let errors = {
  blockNotFound: id => `block (${id}) не найден`,
}

export function mark(given, correct, answers, isMultiple) {
  correct.sort((a, b) => a - b)
  given.sort((a, b) => a - b)
  let isCorrect = isEqual(correct, given)

  if (isCorrect) {
    return 1
  }

  if (given.length === 0) {
    return 0
  }

  if (!isMultiple) {
    return -1 / answers.length
  }

  let errorsNumber = 0
  correct.forEach((cor) => {
    let ind = given.indexOf(cor)
    if (ind === -1) {
      errorsNumber++
    }
  })

  if (errorsNumber > 1) {
    return -errorsNumber / answers.length
  }

  return 0
}

export async function blockResults(activeBlockId) {
  let activeBlock = await ActiveQuestionBlock.findOne({ _id: activeBlockId })
    .populate({
      path: 'activeQuestions',
      populate: {
        path: 'userAnswers.user',
        select: '-hashedPassword',
      },
    })
    .populate({
      path: 'activeQuestions',
      populate: {
        path: 'question',
      }
    })
    .exec()

  if (!activeBlock) {
    return Promise.reject(errors.blockNotFound)
  }

  let users = []
  activeBlock.activeQuestions.forEach((activeQuestion) => {
    activeQuestion.userAnswers.forEach((userAnswer) => {
      let usersIds = users.map(it => it._id.toString())
      if (usersIds.indexOf(userAnswer.user._id.toString()) === -1) {
        users.push(userAnswer.user)
      }
    })
  })

  let questions = activeBlock.activeQuestions.map(it => it.question)
  let questionsIds = questions.map(it => it._id.toString())

  let results = users.map(() => [])
  activeBlock.activeQuestions.forEach((activeQuestion) => {
    let columnNumber = questionsIds.indexOf(activeQuestion.question._id.toString())

    activeQuestion.userAnswers.forEach((userAnswer) => {
      let usersIds = users.map(it => it._id.toString())
      let index = usersIds.indexOf(userAnswer.user._id.toString())
      let userRow = results[index]

      let correctAnswers = activeQuestion.question.correctAnswers
      let givenAnswer = userAnswer.answer
      let answers = activeQuestion.question.answers 

      userRow[columnNumber] = mark(givenAnswer, correctAnswers, answers, activeQuestion.question.multiple)
    })
  })

  for (let i = 0; i < results.length; i++) {
    for (let j = 0; j < results[i].length; j++) {
      if (results[i][j] === undefined) {
        results[i][j] = 0
      }
    }
  }

  let columns = questions.length
  let rows = users.length

  let table = {
    columns,
    rows,
    users,
    questions,
    results,
  }

  return Promise.resolve(table)
}

export async function blockResultsForStudent(activeBlockId, studentId) {
  let activeBlock = await ActiveQuestionBlock.findOne({ _id: activeBlockId })
    .populate({
      path: 'activeQuestions',
      populate: {
        path: 'userAnswers.user',
        select: '-hashedPassword',
      },
    })
    .populate({
      path: 'activeQuestions',
      populate: {
        path: 'question',
      }
    })
    .exec()

  if (!activeBlock) {
    return Promise.reject(errors.blockNotFound)
  }

  let answers = []
  let sum = 0
  activeBlock.activeQuestions.forEach((activeQuestion) => {
    let answer = activeQuestion.userAnswers.filter(userAnswer => userAnswer.user._id.toString() === studentId)[0]
    let correct = activeQuestion.question.correctAnswers

    let given = answer ? answer.answer : []
    let answerMark = mark(given, correct, activeQuestion.question.answers, activeQuestion.question.multiple)
    answers.push({
      given,
      correct,
      mark: answerMark,
    })

    sum += answerMark
  })

  return {
    answers,
    sum,
  }
}
