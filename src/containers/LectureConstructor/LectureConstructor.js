import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { Alert, Button, Input } from 'react-bootstrap'
import { default as Slide } from './Slide/Slide'
import { default as NewSlide } from './Slide/NewSlide'

import {
  // selectors
  getSlides,
  getLectureName,

  // actions
  setSlideType,
  setLectureName,
  removeSlide,
  toggleExpanded,
  setSlideText,
  setSlideName,
  setSlideImages,
  setAnswer,
  makeAnswerSymbolic,
  checkCorrectAnswer,
  checkMultipleChoice,
  setAnswerInBlock,
  checkCorrectAnswerInBlock,
  checkMultipleChoiceInBlock,
  setQuestionNameInBlock,
  deleteQuestionInBlock,
  saveToLocalStorage,
  loadFromLocalStorage,
  saveLecture,
  isSaveFail,
  isCheckFail,
  isSaveOk,
} from '../../redux/modules/lectureConstructor'

export class LectureConstructorPure extends Component {
  state = {
    saveInterval: null,
  }

  componentDidMount() {
    this.props.loadFromLocalStorage()
    let saveInterval = setInterval(() => this.props.saveToLocalStorage(), 30000)
    this.setState({ saveInterval })
  }

  componentWillUnmount() {
    clearInterval(this.state.saveInterval)
  }

  render() {
    let slideHandlers = (slide) => {
      let slideId = slide.get('_id')

      let common = {
        setSlideType: type => this.props.setSlideType(slideId, type),
        remove: () => this.props.removeSlide(slideId),
        toggleExpanded: () => this.props.toggleExpanded(slideId),
        setName: name => this.props.setSlideName(slideId, name),
      }

      let specific = {}
      let slideType = slide.get('type')
      if (slideType === 'text') {
        specific = {
          setText: text => this.props.setSlideText(slideId, text),
          setImages: (images) => this.props.setSlideImages(slideId, images),
        }
      } else if (slideType === 'question') {
        let questionId = slide.getIn(['content', 'questionId'])
        specific = {
          setAnswer: (answerId, value) => this.props.setAnswer(questionId, answerId, value),
          checkCorrectAnswer: (answerId, checked) => this.props.checkCorrectAnswer(questionId, answerId, checked),
          toggleMultipleChoice: checked => this.props.checkMultipleChoice(questionId, checked),
          setImages: (images) => this.props.setSlideImages(slideId, images),
          makeAnswerSymbolic: checked => this.props.makeAnswerSymbolic(questionId, checked),
        }
      } else if (slideType === 'block') {
        specific = {
          setAnswer: (questionId, answerId, value) => this.props.setAnswerInBlock(questionId, answerId, value),
          checkCorrectAnswer: (questionId, answerId, checked) => this.props.checkCorrectAnswerInBlock(questionId, answerId, checked),
          toggleMultipleChoice: (questionId, checked) => this.props.checkMultipleChoiceInBlock(questionId, checked),
          setQuestionNameInBlock: (questionId, name) => this.props.setQuestionNameInBlock(questionId, name),
          deleteQuestionInBlock: questionId => this.props.deleteQuestionInBlock(slideId, questionId),
          makeAnswerSymbolic: (questionId, checked) => this.props.makeAnswerSymbolic(questionId, checked),
        }
      }

      return Object.assign({}, common, specific)
    }

    return (
      <div className="container">
        <div style={{
          paddingTop: '10px',
        }}>
          <Input
            style={{width: '50%', resize: 'none'}}
            value={this.props.lectureName}
            type="textarea"
            placeholder="Название лекции"
            onChange={ev => this.props.setLectureName(ev.target.value)}/>
          {this.props.slides.map(slide => 
            <Slide key={slide.get('_id')}
              _id={slide.get('_id')}
              data={slide}
              {...slideHandlers(slide)} />
          )}
          <NewSlide />
          <Button style={{marginTop: '10px'}} bsStyle="success" onClick={() => this.props.saveLecture()}>Сохранить лекцию</Button>
          {
            this.props.isCheckFail &&
            <Alert bsStyle="danger">
              <span>Проверьте:</span>
              <ul>
                <li>У лекции должно быть имя</li>
                <li>У каждого слайда тоже должно быть имя</li>
                <li>Вопрос считается завершенным, только если у него есть хотя бы один вариант ответа И хотя бы один вариант ответа отмечен как корректный</li>
                <li>В блоке ВСЕ вопросы должны быть завершены, не считая последнего. Последний вопрос в блоке должен оставаться пустым.</li>
              </ul>
            </Alert>
          }
          {
            this.props.isSaveFail &&
            <Alert bsStyle="danger">
              Ошибка сервера.
            </Alert>
          }
          {
            this.props.isSaveOk &&
            <Alert bsStyle="success">
              Сохранено!
            </Alert>
          }
        </div>
      </div>
    )
  }
}

LectureConstructorPure.propTypes = {
  slides: PropTypes.object.isRequired,
  lectureName: PropTypes.string.isRequired,

  // bind functions
  setSlideType: PropTypes.func.isRequired,
  setLectureName: PropTypes.func.isRequired,
  removeSlide: PropTypes.func.isRequired,
  toggleExpanded: PropTypes.func.isRequired,
  setSlideText: PropTypes.func.isRequired,
  setSlideName: PropTypes.func.isRequired,
  setSlideImages: PropTypes.func.isRequired,
  setAnswer: PropTypes.func.isRequired,
  makeAnswerSymbolic: PropTypes.func.isRequired,
  checkCorrectAnswer: PropTypes.func.isRequired,
  checkMultipleChoice: PropTypes.func.isRequired,
  setQuestionNameInBlock: PropTypes.func.isRequired,
  setAnswerInBlock: PropTypes.func.isRequired,
  checkCorrectAnswerInBlock: PropTypes.func.isRequired,
  checkMultipleChoiceInBlock: PropTypes.func.isRequired,
  deleteQuestionInBlock: PropTypes.func.isRequired,
  saveToLocalStorage: PropTypes.func.isRequired,
  loadFromLocalStorage: PropTypes.func.isRequired,
  saveLecture: PropTypes.func.isRequired,
  isSaveFail: PropTypes.bool.isRequired,
  isSaveOk: PropTypes.bool.isRequired,
  isCheckFail: PropTypes.bool.isRequired,
}

export function mapStateToProps(state) {
  return {
    slides: getSlides(state),
    lectureName: getLectureName(state),
    isSaveFail: isSaveFail(state),
    isCheckFail: isCheckFail(state),
    isSaveOk: isSaveOk(state),
  }
}

export let bindFunctions = {
  setSlideType,
  setLectureName,
  removeSlide,
  toggleExpanded,
  setSlideText,
  setSlideName,
  setSlideImages,
  setAnswer,
  makeAnswerSymbolic,
  checkCorrectAnswer,
  checkMultipleChoice,
  setQuestionNameInBlock,
  setAnswerInBlock,
  checkCorrectAnswerInBlock,
  checkMultipleChoiceInBlock,
  deleteQuestionInBlock,
  saveToLocalStorage,
  loadFromLocalStorage,
  saveLecture,
}

export default connect(
  mapStateToProps,
  bindFunctions,
)(LectureConstructorPure)
