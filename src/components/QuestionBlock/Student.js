import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import isEqual from 'lodash/isEqual'
import math from 'mathjs'

import { Question, QuestionResult } from 'components'

import { answer } from 'redux/modules/activeQuestions'

import { 
  getByActiveLectureIdAndQuestionBlockId as getActiveQuestionBlock,
  load as loadQuestionBlock,
  getRelatedActiveQuestions,
} from 'redux/modules/activeQuestionBlocks'

import { currentUserId as getCurrentUserId, getCurrentUser } from '../../redux/modules/auth'


export function mapProps(state, props) {
  let activeQuestionBlock = getActiveQuestionBlock(state, props.activeLectureId, props.questionBlock._id)
  
  let activeQuestions
  if (activeQuestionBlock) {
    activeQuestions = getRelatedActiveQuestions(state, activeQuestionBlock._id)
  }
  
  return {
    activeQuestionBlock,
    currentUserId: getCurrentUserId(state),
    user: getCurrentUser(state),
    activeQuestions,
  }
}


@connect(mapProps, {
  loadQuestionBlock,
  answer,
})
export class Student extends Component {
  static propTypes = {
    // from parent
    questionBlock: PropTypes.object.isRequired,
    activeLectureId: PropTypes.string.isRequired,

    // from @connect
    currentUserId: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    activeQuestionBlock: PropTypes.object,
    activeQuestions: PropTypes.array,

    // bind functions
    loadQuestionBlock: PropTypes.func.isRequired,
    answer: PropTypes.func.isRequired,
  }

  componentDidMount() {
    let { loadQuestionBlock, activeLectureId, questionBlock } = this.props
    loadQuestionBlock(activeLectureId, questionBlock._id)
  }

  getNotAnsweredQuestion() {
    let { questionBlock, activeQuestionBlock, currentUserId } = this.props
    if (!activeQuestionBlock) {
      return null
    }

    let notEnded = questionBlock.questions.filter(question => {
      let activeQuestion = activeQuestionBlock.questionToActiveQuestionMapping[question._id]
      let currentUserAnswers = activeQuestion.userAnswers.filter(it => it.user === currentUserId)
      return !currentUserAnswers.length
    })

    if (!notEnded.length) {
      return null
    }

    return notEnded[0]
  }

  getUserAnswer(user, question) {
    let { activeQuestions } = this.props

    if (!activeQuestions) return null
    let activeQuestion = activeQuestions.filter(aq => aq.question === question._id)[0]

    if (!activeQuestion) return null
    let userAnswer = activeQuestion.userAnswers.filter(ans => ans.user === user._id)[0]

    return userAnswer
  }

  isUserAnswerEmpty(user, question) {
    let userAnswer = this.getUserAnswer(user, question)
    if (!userAnswer) return true

    return userAnswer.answer.length === 0
  }

  isAnswerCorrect(user, question) {
    let userAnswer = this.getUserAnswer(user, question)

    if (!userAnswer) return null
    let sortedUser = userAnswer.answer.sort((a, b) => a - b) // eslint-disable-line
    let sortedReal = question.correctAnswers
    let isAnswerCorrect = false;
    if (!question.isAnswerSymbolic) {
      isAnswerCorrect = isEqual(sortedUser, sortedReal)
    } else {
      isAnswerCorrect = isEqual(math.eval(question.correctAnswers[0]), math.eval(sortedUser[0]))
    }
    return isAnswerCorrect
  }

  showResult() {
    let { questionBlock, user } = this.props

    let sum = questionBlock.questions.reduce((result, question) => {
      let isEmpty = this.isUserAnswerEmpty(user, question)
      if (isEmpty) {
        return result
      }

      let isCorrect = this.isAnswerCorrect(user, question)
      if (isCorrect) {
        return result + 1
      }

      return result - 1 / question.answers.length
    }, 0)

    return (
      <div>
        <h1>Результаты</h1>
        <b>Сумма: {sum}</b>
        {
          questionBlock.questions.map(question => this.renderQuestion(question, true))
        }
      </div>
    )
  }

  renderQuestion(question, renderResult = false) {
    let { activeQuestionBlock, answer, currentUserId } = this.props
    if (!activeQuestionBlock) {
      return null
    }
    let activeQuestion = activeQuestionBlock.questionToActiveQuestionMapping[question._id]

    if (renderResult) {
      return (
        <QuestionResult
          key={question._id}
          question={question}
          activeQuestion={activeQuestion}
          currentUserId={currentUserId}/>
      )
    }

    return (
      <Question
        isActive
        isStudent
        key={question._id}
        question={question}
        activeQuestion={activeQuestion}
        onAnswer={answers => answer(activeQuestion._id, answers)}
        currentUserId={currentUserId}
        showResult={false}/>
    )
  }

  render() {
    let { activeQuestionBlock } = this.props

    if (activeQuestionBlock && activeQuestionBlock.ended) {
      return this.showResult()
    }

    let notAnsweredQuestion = this.getNotAnsweredQuestion()
    if (!notAnsweredQuestion) {
      return (
        <div style={{fontSize: '1.2em', fontWeight: 'bold', paddingTop: '2em'}}>
          Вы ответили на все вопросы. Подождите пожалуйста окончания теста.
        </div>
      )
    }

    return this.renderQuestion(notAnsweredQuestion)
  }
}
