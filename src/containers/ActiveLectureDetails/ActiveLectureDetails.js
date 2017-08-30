import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { asyncConnect } from 'redux-async-connect'
import Helmet from 'react-helmet'
import moment from 'moment'
import { Table } from 'react-bootstrap'

import { 
  loadSingle as loadActiveLectureById, 
  getById as getActiveLectureById 
} from 'redux/modules/activeLectures'

import { 
  loadById as loadActiveQuestionBlock,
  getRelatedQuestions, 
  getRelatedQuestionsIds,
  getById as getActiveQuestionBlock,
  getUserIds,
  getRelatedUsers,
  getQuestionResults
} from 'redux/modules/activeQuestionBlocks'

import {
  loadSingle as loadQuestion
} from 'redux/modules/questions'

import {
  loadSingle as loadUser,
  // getById as getUser
} from 'redux/modules/users'

function getQuestions(state, activeLecture) {
  if (!activeLecture) {
    return []
  }

  let questions = {}
  let activeQuestionBlocksIds = activeLecture.activeQuestionBlocks
  activeQuestionBlocksIds.forEach(id => {
    let questionsArray = getRelatedQuestions(state, id) || []
    questionsArray.forEach(question => questions[question._id] = question)
  })

  return Object.keys(questions).map(key => questions[key])
}

@asyncConnect([{
  deferred: false,
  promise: async ({ store: { dispatch, getState }, params: { activeLectureId } }) => {
    let activeLecture = await dispatch(loadActiveLectureById(activeLectureId))

    let promises = activeLecture.activeQuestionBlocks
          .map(id => dispatch(loadActiveQuestionBlock(id)))
    let activeQuestionBlocks = await Promise.all(promises)

    let outerPromises = []
    activeQuestionBlocks.forEach(block => {
      let questionsIds = getRelatedQuestionsIds(getState(), block._id)
      let promises = questionsIds.map(id => dispatch(loadQuestion(id)))
      outerPromises.push(...promises)
    })

    await Promise.all(outerPromises)

    outerPromises = []
    activeQuestionBlocks.forEach(block => {
      let userIds = getUserIds(getState(), block._id)
      promises = userIds.map(id => dispatch(loadUser(id)))
      outerPromises.push(...promises)
    })

    return await Promise.all(outerPromises)
  }
}])
@connect((state, { params: { activeLectureId } }) => {
  let activeLecture = getActiveLectureById(state, activeLectureId)
  let activeQuestionBlocks = activeLecture.activeQuestionBlocks.map(id => getActiveQuestionBlock(state, id))
  activeQuestionBlocks.forEach(block => {
    block.expandedQuestions = getRelatedQuestions(state, block._id) || []
    block.expandedUsers = getRelatedUsers(state, block._id) || []
    block.expandedUsers.forEach(user => {
      user.questionResults = getQuestionResults(state, user._id, block._id)
    })
  })
  return {
    activeLecture,
    activeLectureId,
    questions: getQuestions(state, activeLecture),
    blocks: activeQuestionBlocks
  }
})
export default class ActiveLectureDetails extends Component {
  static propTypes = {
    activeLecture: PropTypes.object,
    activeLectureId: PropTypes.string.isRequired,
    questions: PropTypes.array,
    blocks: PropTypes.array
  }

  render() {
    let { activeLecture, activeLectureId, blocks } = this.props
    if (!activeLecture || !blocks) {
      return <Helmet title={`Подробости прошедшей лекции - ${activeLectureId}`}/>
    }

    for (let ind = 0; ind < blocks.length; ind++) {
      if (!blocks[ind].expandedQuestions || !blocks[ind].expandedUsers) {
        return <Helmet title={`Подробости прошедшей лекции - ${activeLectureId}`}/>
      }
    }

    let name = activeLecture.lecture.name
    let date = moment(activeLecture.created).format('DD.MM.YYYY, HH:mm:ss')

    // console.log(blocks)

    return (
      <div className="container">
        <Helmet title={'Подробости прошедшей лекции: ' + name + ' ' + date}/>
        <h1 style={{fontSize: '1.2em'}}>{name}</h1>
        <span>Была запущена: {date}</span>
        {
          blocks.map(block => (
            <Table key={block._id} responsive>
              <thead>
                <tr>
                  <th></th>
                  {
                    block.expandedQuestions.map((it, ind) => <th key={it._id}>{ind + 1}</th>)
                  }
                  <th>Результат</th>
                </tr>
              </thead>
              <tbody>
                {
                  block.expandedUsers.map(user => {
                    let result = Object.keys(user.questionResults).reduce((result, key) => result + user.questionResults[key], 0)
                    return (
                      <tr key={user._id}>
                        <th>{user.username}</th>
                        {
                          block.expandedQuestions.map(question => {
                            // console.log(question)
                            // console.log(user)
                            return <th key={question._id}>{user.questionResults[question._id]}</th>
                          })
                        }
                        <th>{result}</th>
                    </tr>
                    )
                  })
                }
              </tbody>
            </Table>
          ))
        }
      </div>
    )
  }
}
