import React, { Component, PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import cloneDeep from 'lodash/cloneDeep'
import difference from 'lodash/difference'

import compileKatex from 'utils/compileKatex'


export default class QuestionResult extends Component {
  static propTypes = {
    question: PropTypes.object,
    activeQuestion: PropTypes.object,
    currentUserId: PropTypes.string,
  }

  componentDidMount() {
    compileKatex(findDOMNode(this))
  }

  componentDidUpdate() {
    compileKatex(findDOMNode(this))
  }

  getCurrentUserAnswer() {
    let { activeQuestion, currentUserId } = this.props

    let didCurrentUserAnswer = activeQuestion && activeQuestion.userAnswers
        .filter(({user}) => user === currentUserId).length === 1

    let currentUserAnswer = []
    if (didCurrentUserAnswer) {
      currentUserAnswer = activeQuestion.userAnswers
        .filter(({user}) => user === currentUserId)[0].answer
      currentUserAnswer = cloneDeep(currentUserAnswer).sort()
    }

    return currentUserAnswer
  }

  textStyle(index) {
    let { question } = this.props

    let correctAnswer = cloneDeep(question.correctAnswers).sort()
    let currentUserAnswer = this.getCurrentUserAnswer()

    let falseAnswers = difference(currentUserAnswer, correctAnswer)

    if (correctAnswer.indexOf(index) >= 0) {
      return {
        color: 'green',
        fontWeight: 'bold',
      }
    }

    if (falseAnswers.indexOf(index) >= 0) {
      return {
        color: 'red',
        fontWeight: 'bold',
      }
    }
  }

  render() {  
    let { question } = this.props
    let currentUserNotAnswered = !this.getCurrentUserAnswer().length

    return (
      <div className="container">
        <h3 className="katexable">{question.question}</h3>
        {
          currentUserNotAnswered && <b style={{color: 'red'}}>Вопрос был пропущен</b>
        }
        <ul>
          {
            question.answers.map((answer, key) => (
              <li className="katexable" key={key} style={this.textStyle(key)}>
                {answer}
              </li>)
            )
          }
        </ul>
      </div>
    )
  }
}
