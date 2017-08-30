import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {asyncConnect} from 'redux-async-connect'
import {Button} from 'react-bootstrap'
import {isEqual} from 'lodash'

import {Module, Question, QuestionBlock} from 'components'
import Col from 'react-bootstrap/lib/Col'

import {loadSingle} from 'redux/modules/lectures'
import {loadSingle as loadSingleModule} from 'redux/modules/modules'
import {
  loadSingle as loadSingleQuestion,
  start as startQuestion,
  finish as finishQuestion
} from 'redux/modules/questions'
import {listenQuestion, update as updateActiveQuestion, answer} from 'redux/modules/activeQuestions'
import {loadSingle as loadSingleActiveLecture, localLectureFinish, slideChanged} from 'redux/modules/activeLectures'
import { 
  loadSingle as loadSingleQuestionBlock, 
  getExpanded as getQuestionBlockExpanded
} from 'redux/modules/questionBlocks'
import { localFinishBlock } from 'redux/modules/activeQuestionBlocks'
import {toggleSlide} from 'redux/modules/activeLectures'
import {routeActions} from 'react-router-redux'

function isLecturer(state, lectureId) {
  return state.auth.user._id === state.activeLectures.list[lectureId].speaker._id
}

function loadQuestions(moduleNumber, lecture, dispatch) {
  let map = lecture.mapping[moduleNumber]
  if (map.type === 'questionBlock') {
    return dispatch(loadSingleQuestionBlock(lecture.questionBlocks[map.index]))
  }

  return Promise.resolve()
}

@asyncConnect([{
  promise: ({store: {getState, dispatch}, params: {lectureId, moduleNumber}}) => {
    return dispatch(loadSingleActiveLecture(lectureId))
      .then(activeLecture => {
        let state = getState()
        let lecture = state.lectures.list[activeLecture.lecture]
        return lecture ? lecture : dispatch(loadSingle(activeLecture.lecture))
      })
      .then(lecture => {
        if (lecture.mapping.length === 0) {
          let moduleId
          if (typeof lecture.modules[moduleNumber] === 'string') {
            moduleId = lecture.modules[moduleNumber]
          } else if (typeof lecture.modules[moduleNumber] === 'object') {
            moduleId = lecture.modules[moduleNumber]._id
          }

          return dispatch(loadSingleModule(moduleId))
        }

        let elementMapping = lecture.mapping[moduleNumber]
        let collectionName = elementMapping.type + 's'
        let moq = lecture[collectionName][elementMapping.index]
        let moqId = typeof moq === 'string' ? moq : moq._id

        if (elementMapping.type === 'module') {
          return dispatch(loadSingleModule(moqId)) 
        } else if (elementMapping.type === 'question') {
          return Promise.all([
            dispatch(loadSingleQuestion(moqId)),
            isLecturer(getState(), lectureId) ?
              dispatch(startQuestion(lectureId, moqId)) :
              dispatch(listenQuestion(lectureId, moqId))
          ])
        } else if (elementMapping.type === 'questionBlock') {
          return Promise.all([
            loadQuestions(moduleNumber, lecture, dispatch)
          ])
        }
      })
      .catch(() => dispatch(routeActions.push('/notFound')))
  }
}])
@connect(
  (state, {params: {lectureId, moduleNumber}}) => {
    if (!state.activeLectures.list[lectureId]) {
      return {}
    }

    let activeLecture = state.activeLectures.list[lectureId]
    let lecId = typeof activeLecture.lecture === 'object' ? activeLecture.lecture._id : activeLecture.lecture
    let {mapping, modules, questions, questionBlocks} = state.lectures.list[lecId]

    let basic = {
      module: null,
      question: null,
      questionBlock: null,
      lastModule: modules.length + questions.length + questionBlocks.length - 1 === +moduleNumber,
      firstModule: +moduleNumber === 0,
      moduleNumber: +moduleNumber,
      lectureId: lecId,
      activeLectureId: lectureId,
      isStudent: state.auth.user._id !== (
        typeof activeLecture.speaker === 'object' ?
          activeLecture.speaker._id :
          activeLecture.speaker
      ),
      mapping: mapping,
      modules: modules,
      questions: questions,
      isLectureFinished: activeLecture.ended,
      currentUserId: state.auth.user._id,
      changingSlide: state.activeLectures.changingSlide
    }

    let currentElement = mapping[moduleNumber]
    if (currentElement.type === 'module') {
      if (typeof modules[currentElement.index] === 'string') {
        basic.module = state.modules.data.filter(({_id}) => _id === modules[currentElement.index])[0]
      } else if (typeof modules[currentElement.index] === 'object') {
        basic.module = modules[currentElement.index]
      }
    } else if (currentElement.type === 'question') {
      if (typeof questions[currentElement.index] === 'string') {
        basic.question = state.questions.list[questions[currentElement.index]]
      } else if (typeof questions[currentElement.index] === 'object') {
        basic.question = questions[currentElement.index]
      }

      let qid = basic.question._id
      let activeQuestions = Object.values(state.activeQuestions.list)
      basic.activeQuestion = activeQuestions.filter(aq => aq.question === qid)[0]
    } else if (currentElement.type === 'questionBlock') {
      basic.questionBlock = getQuestionBlockExpanded(state, questionBlocks[currentElement.index])
    }

    return basic
  },
  {
    pushState: routeActions.push,
    toggleSlide,
    localLectureFinish,
    startQuestion,
    listenQuestion,
    updateActiveQuestion,
    finishQuestion,
    answer,
    slideChanged,
    localFinishBlock
  }
)
export default class Lecture extends Component {
  static propTypes = {
    module: PropTypes.object,
    question: PropTypes.object,
    activeQuestion: PropTypes.object,
    firstModule: PropTypes.bool.isRequired,
    lastModule: PropTypes.bool.isRequired,
    lectureId: PropTypes.string.isRequired,
    moduleNumber: PropTypes.number.isRequired,
    toggleSlide: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    activeLectureId: PropTypes.string.isRequired,
    isStudent: PropTypes.bool.isRequired,
    localLectureFinish: PropTypes.func.isRequired,
    isLectureFinished: PropTypes.bool.isRequired,
    startQuestion: PropTypes.func.isRequired,
    listenQuestion: PropTypes.func.isRequired,
    updateActiveQuestion: PropTypes.func.isRequired,
    finishQuestion: PropTypes.func.isRequired,
    answer: PropTypes.func.isRequired,
    currentUserId: PropTypes.string.isRequired,
    mapping: PropTypes.array.isRequired,
    modules: PropTypes.array.isRequired,
    questionBlock: PropTypes.any,
    localFinishBlock: PropTypes.func.isRequired,
    slideChanged: PropTypes.func.isRequired
  }

  componentDidMount() {
    let {
      isStudent,
      activeLectureId,
      pushState,
      localLectureFinish,
      updateActiveQuestion,
      localFinishBlock
    } = this.props

    // наверное, это стоит вынести в middleware
    // или в asyncConnect
    if (socket) {
      console.log(`lecture ${activeLectureId}`)
      socket.on(`lecture ${activeLectureId}`, data => {
        if (data.type === 'SLIDE_CHANGE' && isStudent) {
          // localChangeSlide(data.activeLecture._id, data.activeLecture.ongoingModule)
          console.log(data)
          pushState(`/lecture/${data.activeLecture._id}/${data.activeLecture.ongoingModule}`)
          global.Plotter.globalEmitter.emit('destroy')
        }

        if (data.type === 'QUESTION_FINISH' && isStudent) {
          updateActiveQuestion(data.activeQuestion)
        }

        if (data.type === 'FINISH_BLOCK' && isStudent) {
          localFinishBlock(data.activeQuestionBlockId)
        }

        if (data.type === 'FINISH') {
          localLectureFinish(data.activeLecture)
        }
      })
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.moduleNumber !== this.props.moduleNumber) {
      this.props.slideChanged()
      return true
    }

    if (nextProps.changingSlide) {
      return false
    }

    return !isEqual(this.props, nextProps)
  }

  move(moduleNumber) {
    let {lectureId, pushState, toggleSlide, activeLectureId} = this.props
    toggleSlide(lectureId, moduleNumber)
    pushState(`/lecture/${activeLectureId}/${moduleNumber}`)
    global.Plotter.globalEmitter.emit('destroy') // remove all data on graphs
  }

  render() {
    let {
      lastModule,
      firstModule,
      moduleNumber,
      isStudent,
      isLectureFinished,
      module,
      question,
      activeQuestion,
      finishQuestion,
      activeLectureId,
      answer,
      currentUserId,
      mapping,
      modules,
      questionBlock
    } = this.props
    let offset = lastModule ? 2 : 1

    let menuStyle = {
      position: 'fixed',
      padding: '20px 10px 20px 10px',
      zIndex: 100,
      top: '50px',
      right: '0px',
      backgroundColor: '#dddddd',
      bottom: '5px',
      direction: 'rtl',
      overflowY: 'scroll',
      borderWidth: '5px',
      borderStyle: 'outset'
    }

    if (isLectureFinished) {
      return (
        <div className="container">
          <h2>Лекция завершена!</h2>
          <h4>Спасибо за внимание</h4>
        </div>
      )
    }

    return (
      <div className="container">
        {
          !!module &&
          <Module module={module} isSynchronizationActive isStudent={isStudent}/>
        }
        {
          !!question &&
          <Question
            question={question}
            activeQuestion={activeQuestion}
            isActive
            isStudent={isStudent}
            onFinish={() => finishQuestion(activeLectureId, activeQuestion._id)}
            onAnswer={answers => answer(activeQuestion._id, answers)}
            currentUserId={currentUserId}
          />
        }
        {
          !!questionBlock &&
          <QuestionBlock 
            questionBlock={questionBlock}
            activeLectureId={activeLectureId}
            isStudent={isStudent}/>
        }
        {
          !isStudent &&
          <div>
            {!firstModule &&
            <Col xs={1} sm={1} md={1} lg={1}>
              <a onClick={() => this.move(moduleNumber - 1) }>← Назад</a>
            </Col>}
            {!lastModule &&
            <Col xs={1} sm={1} md={1} lg={1}
                 xsOffset={offset}
                 smOffset={offset}
                 mdOffset={offset}
                 lgOffset={offset}>
              <a onClick={() => this.move(moduleNumber + 1) }>Вперед →</a>
            </Col>}
          </div>
        }
        {!isStudent && 
        <div style={menuStyle}>
          {mapping.map( (element, id) =>
            <div key={element._id} style={{ display: 'block', margin: '5px auto'}}>
              <center>
                <Button onClick={()=>{this.move(id)}}>
                  {
                    element.type === 'module'
                    ? modules[element.index].name
                    : `Вопрос ${element.index}`
                  }
                </Button>
              </center>
            </div>
          )}
        </div>}
      </div>
    )
  }
}
