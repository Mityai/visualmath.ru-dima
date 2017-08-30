
/* eslint-disable */
import React, { Component, PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import isEqual from 'lodash/isEqual'

import compileKatex from 'utils/compileKatex'

// components
import { Question } from 'components'
import { Button, Table } from 'react-bootstrap'

// selectors
import {
  getByActiveLectureIdAndQuestionBlockId as getActiveQuestionBlock,
  localFinishBlock,
  loadUsers,
  getUsers,
  loadActiveQuestions,
  getRelatedActiveQuestions,
} from '../../redux/modules/activeQuestionBlocks'
import { currentUserId as getCurrentUserId } from 'redux/modules/auth'

// actions
import { start, finish } from 'redux/modules/questionBlocks'

import {ExcellentExport} from '../../../libs/excellentexport.js'


export function mapProps(state, props) {
  let activeQuestionBlock = getActiveQuestionBlock(state, props.activeLectureId, props.questionBlock._id)

  let users
  let activeQuestions
  if (activeQuestionBlock) {
    users = getUsers(state, activeQuestionBlock._id)
    activeQuestions = getRelatedActiveQuestions(state, activeQuestionBlock._id)
  }

  return {
    users,
    activeQuestions,
    activeQuestionBlock,
    currentUserId: getCurrentUserId(state),
  }
}


@connect(mapProps, {
  start,
  finish,
  localFinishBlock,
  loadUsers,
  loadActiveQuestions,
})
export class Speaker extends Component {
  static propTypes = {
    // from parent
    questionBlock: PropTypes.object.isRequired,
    activeLectureId: PropTypes.string.isRequired,

    // from connect
    currentUserId: PropTypes.string,
    activeQuestionBlock: PropTypes.object,
    users: PropTypes.array,
    activeQuestions: PropTypes.array,

    // actions
    start: PropTypes.func.isRequired,
    finish: PropTypes.func.isRequired,
    localFinishBlock: PropTypes.func.isRequired,
    loadUsers: PropTypes.func,
    loadActiveQuestions: PropTypes.func,
  }

  componentDidMount() {
    let { activeQuestionBlock, start, activeLectureId, questionBlock } = this.props

    if (!activeQuestionBlock) {
      start(activeLectureId, questionBlock._id)
    }

    compileKatex(findDOMNode(this))
  }

  componentDidUpdate() {
    let { loadUsers, activeQuestionBlock, users, loadActiveQuestions, activeQuestions } = this.props
    if (activeQuestionBlock && !users) {
      loadUsers(activeQuestionBlock._id)
    }

    if (activeQuestionBlock && !activeQuestions) {
      loadActiveQuestions(activeQuestionBlock._id)
    }
  }

  finishBlock() {
    let { activeQuestionBlock, finish, localFinishBlock } = this.props

    let finishingPromise = finish(activeQuestionBlock._id)
    finishingPromise
      .then(() => localFinishBlock(activeQuestionBlock._id))
      .then(() => window.location.reload())

    return finishingPromise
  }

  renderQuestionOld(question) {
    let { activeQuestionBlock } = this.props
    if (!activeQuestionBlock) {
      return null
    }

    let activeQuestion = activeQuestionBlock.questionToActiveQuestionMapping[question._id]

    return (
      <Question
        isActive={activeQuestion.ended}
        key={question._id}
        question={question}
        activeQuestion={activeQuestion}
        isStudent={false}
        showResult={false}/>
    )
  }

  renderFinishButton() {
    let { activeQuestionBlock } = this.props
    if (activeQuestionBlock && activeQuestionBlock.ended) {
      return null
    }

    return (
      <Button type="button" bsStyle="danger" onClick={::this.finishBlock}>
        Завершить
      </Button>
    )
  }

  renderUsers() {
    let { users, questionBlock } = this.props

    if (!users) return null

    let questions = questionBlock.questions

    return users.map((user) => {
      let numberOfCorrect = questions.reduce((result, question) => {
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

      numberOfCorrect = Math.floor(numberOfCorrect * 100) / 100
      numberOfCorrect = '' + numberOfCorrect
      numberOfCorrect = numberOfCorrect.replace('.', ',')

      return (
        <tr key={user._id}>
          <td> { user.username } </td>
          { questions.map(question => <td key={question._id}> {this.renderQuestion(user, question)} </td>) }
          <td>{numberOfCorrect}</td>
        </tr>
      )
    })
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
    let isAnswerCorrect = isEqual(sortedUser, sortedReal)

    return isAnswerCorrect
  }

  renderQuestion(user, question) {
    let userAnswer = this.getUserAnswer(user, question)

    let isAnswerCorrect = this.isAnswerCorrect(user, question)

    let answersToShow = userAnswer.answer.map(id => question.answers[id])
    if (!answersToShow) return null
    return <span className="katexable" style={{ color: isAnswerCorrect ? 'green' : 'red' }}>{answersToShow.join(', ')}</span>
  }

  export() {
    let table_data = document.querySelector('#datatable')
    ExcellentExport.excel(
      document.querySelector('#download_anchor'),
      table_data,
      'Sheet Name Here'
    )
  }

  render() {
    let { questionBlock, activeQuestionBlock } = this.props

    if (activeQuestionBlock && !activeQuestionBlock.ended) {
      let questions = questionBlock.questions.map(question => this.renderQuestionOld(question))
      return (
        <div>
          { questions }
          { this.renderFinishButton() }
        </div>
      )
    }

    let questionsToRender = questionBlock.questions.map(question => <th key={question._id} className="katexable">{ question.question }</th>)

    let table = (
      <div style={{ width: '60%' }}>
        <Table id="datatable">
          <thead>
            <tr>
              <th></th>
              { questionsToRender }
              <th>Результат</th>
            </tr>
          </thead>
          <tbody>
            { this.renderUsers() }
          </tbody>
        </Table>
        <a id="download_anchor"
          download="somedata.xls"
          href="#" 
          style={{margin: '5px 0px 0px'}} 
          onClick={() => this.export()
          }>
          Выгрузить Excel
        </a>
      </div>
    )

    return (
      <div>

        <div>{ table }</div>
        {
          !questionsToRender[0] &&
          <span>Загрузка...</span>
        }
      </div>
    )
  }
}
