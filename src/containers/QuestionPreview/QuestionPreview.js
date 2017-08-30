import React, {Component, PropTypes} from 'react'
import {asyncConnect} from 'redux-async-connect'

import {connect} from 'react-redux'

import Helmet from 'react-helmet'
import Col from 'react-bootstrap/lib/Col'

import clone from 'lodash/clone'

import {Question, EditQuestion} from 'components'

import {moduleImageSave} from 'redux/modules/modules'
import {getQuestionById, loadSingle, activateEditMode, editQuestion,
  editQuestionText, editAnswers, editCorrectAnswers,
  editMultiple, editImages} from 'redux/modules/questions'
import {STATUS_EDITING, STATUS_EDITING_SUCCESS, STATUS_EDITING_FAIL} from 'actions/questions'


@asyncConnect([{
  deferred: true,
  promise: ({store: {getState, dispatch}, params: {questionId}}) => {
    let question = getQuestionById(getState(), questionId)
    if (!question) {
      return dispatch(loadSingle(questionId))
    }
  }
}])
@connect(
  (state, {params: {questionId}}) => ({
    question: getQuestionById(state, questionId),
    editingState: state.questions.editing,
  }),
  {activateEditMode, editQuestion, editQuestionText, editAnswers,
    editCorrectAnswers, editMultiple, moduleImageSave, editImages}
)
export default class QuestionPreview extends Component {
  static propTypes = {
    question: PropTypes.object,
    activateEditMode: PropTypes.func.isRequired,
    editQuestionText: PropTypes.func.isRequired,
    editAnswers: PropTypes.func.isRequired,
    editCorrectAnswers: PropTypes.func.isRequired,
    editMultiple: PropTypes.func.isRequired,
    editQuestion: PropTypes.func.isRequired,
    editingState: PropTypes.object.isRequired,
    moduleImageSave: PropTypes.func.isRequired,
    editImages: PropTypes.func.isRequired,
  }

  state = {
    isEditing: false
  }

  answersChange(value, id) {
    let {question, editCorrectAnswers, editAnswers} = this.props
    let answers = clone(question.answers);
    answers[id] = value;

    if (id === answers.length - 1 && !question.isAnswerSymbolic) {
      answers.push('');
    }

    if (value === '') {
      let correctAnswers = clone(question.correctAnswers);
      let index = correctAnswers.indexOf(id);
      if (index > -1) {
        correctAnswers.splice(index, 1);
      }

      editCorrectAnswers(question._id, correctAnswers)
    }

    if (id === answers.length - 2 && value === '' && answers[answers.length - 1] === '') {
      let correctAnswers = clone(question.correctAnswers);
      let index = correctAnswers.indexOf(answers.length - 1);
      if (index > -1) {
        correctAnswers.splice(index, 1);
      }

      answers.pop();
    }

    editAnswers(question._id, answers)
  }

  correctAnswersСhange(checked, id) {
    let {question, editCorrectAnswers} = this.props
    let correctAnswers = clone(question.correctAnswers);
    if (checked) {
      if (correctAnswers.includes(id)) {
        return;
      }

      correctAnswers.push(id);
    } else {
      let answerIndex = correctAnswers.indexOf(id);
      if (answerIndex === -1) {
        return;
      }

      correctAnswers.splice(answerIndex, 1);
    }

    editCorrectAnswers(question._id, correctAnswers)
  }

  editing() {
    let {editQuestion, editQuestionText, question, moduleImageSave, editImages} = this.props

    return (
      <div>
        <Col lg={6} md={6} sm={6} xs={6}>
          <EditQuestion question={question}
                      editQuestionText={questionText => editQuestionText(question._id, questionText)}
                      editAnswers={(value, id) => this.answersChange(value, id)}
                      editCorrectAnswers={(checked, id) => this.сorrectAnswersСhange(checked, id)}
                      setAnswerSymbolic={(isAnswerSymbolic) => {
                        question.isAnswerSymbolic = isAnswerSymbolic;
                      }}
                      save={() => {
                        editQuestion(question._id,
                          {question: question.question,
                          answers: question.answers,
                          correctAnswers: question.correctAnswers,
                          multiple: question.multiple,
                          images: question.images,
                          imagesLeft: question.imagesLeft,
                          imagesTop: question.imagesTop,
                          imagesScale: question.imagesScale,
                          isAnswerSymbolic: question.isAnswerSymbolic})
                          .then(() => {
                            console.log(1)
                            this.setState({isEditing: false})
                          });
                      }}
                      upload={file => moduleImageSave(file)}
                      editImages={(images) => editImages(question._id, images)}
          />
        </Col>
        <Col lg={6} md={6} sm={6} xs={6}>
          <Question question={question} />
        </Col>
      </div>
    )
  }

  normalPreview() {
    return (
      <Col lg={6} lgOffset={3} md={8} mdOffset={2} sm={12} xs={12}>
        <Question question={this.props.question}
                activateEditMode={(id, isActive) => {
                  this.setState({isEditing: true})
                  this.props.activateEditMode(id, isActive)
                }}
                showEditButton
        />
      </Col>
    )
  }

  render() {
    let {question, editingState} = this.props;

    return (
      <div className="container">
        <Helmet title="Предпросмотр вопроса"/>
        {editingState.status === STATUS_EDITING && editingState.id === question._id &&
        <div>
          <i className={'fa fa-cog fa-spin'}/>
        </div>
        }
        {editingState.status === STATUS_EDITING_SUCCESS && editingState.id === question._id &&
        <div className="text-success">
          Вопрос сохранен
        </div>
        }
        {editingState.status === STATUS_EDITING_FAIL && editingState.id === question._id &&
        <div className="text-danger">
          {editingState.error}
        </div>
        }
        {
          this.state.isEditing ?
            ::this.editing() :
            ::this.normalPreview()
        }
      </div>
    )
  }
}
