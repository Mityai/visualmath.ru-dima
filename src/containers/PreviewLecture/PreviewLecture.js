import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { asyncConnect } from 'redux-async-connect'

import { Module } from 'components'
import { Question } from 'components'
import Col from 'react-bootstrap/lib/Col'
import { Link } from 'react-router'

import { 
  getLectureById, 
  loadSingle as loadSingleLecture 
} from 'redux/modules/lectures'
import { 
  loadSingle as loadSingleQuestionBlock, 
  getExpanded as getQuestionBlockExpanded 
} from 'redux/modules/questionBlocks'

function loadQuestions(moduleNumber, lecture, dispatch) {
  let map = lecture.mapping[moduleNumber]
  if (map.type === 'questionBlock') {
    return dispatch(loadSingleQuestionBlock(lecture.questionBlocks[map.index]))
  }

  return Promise.resolve()
}

@asyncConnect([{
  deferred: true,
  promise: ({store: {getState, dispatch}, params: {lectureId, moduleNumber}}) => {
    let lecture = getLectureById(getState(), lectureId)
    if (!lecture) {
      return dispatch(loadSingleLecture(lectureId))
        .then(lecture => loadQuestions(moduleNumber, lecture, dispatch))
    }
    
    return loadQuestions(moduleNumber, lecture, dispatch)
    // если лекция есть и если текущий слайд - блок вопросов, то тогда подгрузить вопросы
    // если лекции нет, то загрузить лекцию. если текущий слайд - блок вопросов, то подгрузить блок вопросов
  }
}])
@connect(
  (state, {params: {lectureId, moduleNumber}}) => {
    let { mapping, modules, questions, questionBlocks } = state.lectures.list[lectureId]

    let basic = {
      module: null,
      question: null,
      questionBlock: null,
      lastModule: modules.length + questions.length + questionBlocks.length - 1 === +moduleNumber,
      firstModule: +moduleNumber === 0,
      moduleNumber: +moduleNumber,
      lectureId
    }

    let currentElement = mapping[moduleNumber]
    if (currentElement.type === 'module') {
      basic.module = modules[currentElement.index]
    } else if (currentElement.type === 'question') {
      basic.question = questions[currentElement.index]
    } else if (currentElement.type === 'questionBlock') {
      basic.questionBlock = getQuestionBlockExpanded(state, questionBlocks[currentElement.index])
    }

    return basic
  }
)
export default class PreviewLecture extends Component {
  static propTypes = {
    module: PropTypes.object,
    question: PropTypes.object,
    questionBlock: PropTypes.any,
    firstModule: PropTypes.bool.isRequired,
    lastModule: PropTypes.bool.isRequired,
    lectureId: PropTypes.string.isRequired,
    moduleNumber: PropTypes.number.isRequired
  }

  render() {
    let { lastModule, moduleNumber, lectureId, firstModule, module, question, questionBlock } = this.props
    let offset = lastModule ? 2 : 1

    if (questionBlock) {
      console.log('questionBlock')
      console.log(questionBlock)
    }

    return (
      <div className="container">
        {
          !!module &&
          <Module module={module}/>
        }
        {
          !!question &&
            <Question question={question}/>
        }
        {
          !!questionBlock &&
          questionBlock.questions.map(question => (
            <div key={question._id}>
              <Question question={question}/>
            </div>
          ))
        }
        <div className="container">
          {!firstModule &&
          <Col xs={1} sm={1} md={1} lg={1}>
            <Link to={`/lecturePreview/${lectureId}/${moduleNumber - 1}`}>← Назад</Link>
          </Col>}
          {!lastModule &&
          <Col xs={1} sm={1} md={1} lg={1}
               xsOffset={offset}
               smOffset={offset}
               mdOffset={offset}
               lgOffset={offset}>
            <Link to={`/lecturePreview/${lectureId}/${moduleNumber + 1}`}>Вперед →</Link>
          </Col>}
        </div>
      </div>
    )
  }
}
