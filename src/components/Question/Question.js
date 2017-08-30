import React, {PropTypes, Component} from 'react'
import {findDOMNode} from 'react-dom'

import clone from 'lodash/clone'

import Button from 'react-bootstrap/lib/Button'
import Input from 'react-bootstrap/lib/Input'
import Alert from 'react-bootstrap/lib/Alert'
import Col from 'react-bootstrap/lib/Col'

import compileKatex from 'utils/compileKatex'

class Wrapper extends Component {
  static propTypes = {
    children: PropTypes.any,
    isFinished: PropTypes.bool,
    isCorrect: PropTypes.bool,
    isFalse: PropTypes.bool,
    showResult: PropTypes.bool
  }

  componentDidMount() {
    compileKatex(findDOMNode(this))
  }

  render() {
    let {children, isFinished, isCorrect, isFalse, showResult} = this.props

    if (!isFinished || !showResult) {
      return (
        <div>
          {children}
        </div>
      )
    }

    if (isCorrect) {
      return (
        <div style={{color: 'green'}}>
          {children}
        </div>
      )
    }

    if (isFalse) {
      return (
        <div style={{color: 'red'}}>
          {children}
        </div>
      )
    }

    return (
      <div>
        {children}
      </div>
    )
  }
}

export default class Question extends Component {
  static propTypes = {
    question: PropTypes.object.isRequired,
    activeQuestion: PropTypes.object,
    isActive: PropTypes.bool,
    isStudent: PropTypes.bool,
    onFinish: PropTypes.func,
    onAnswer: PropTypes.func,
    currentUserId: PropTypes.string,
    showResult: PropTypes.bool,
    showEditButton: PropTypes.bool,
    activateEditMode: PropTypes.func
  }

  defaultProps = {
    showEditButton: false,
    activateEditMode: undefined,
  }

  state = {
    checked: []
  }


  componentDidMount() {
    compileKatex(findDOMNode(this))
  }

  componentDidUpdate() {
    compileKatex(findDOMNode(this))
  }

  onCheck(checked, key) {
    let {question: {multiple}} = this.props
    if (!multiple) {
      this.setState({checked: [key]})
      return
    }

    if (!checked) {
      let checkedArr = this.state.checked
      let ind = checkedArr.indexOf(key)
      if (ind > -1) {
        checkedArr.splice(ind, 1)
        this.setState({checked: checkedArr})
      }
    } else {
      this.setState({checked: [...this.state.checked, key]})
    }
  }

  editQuestion() {
    if (!this.props.activateEditMode) {
      return
    }

    this.props.activateEditMode(this.props.question._id, true)
  }

  preview() {
    let styles = require('./Question.scss');
    let {question, showEditButton} = this.props

    return (
      <div className={`${styles.question}`}>
        <div className={styles['edit-button']}
          onClick={() => this.editQuestion()}>
          {showEditButton && <span
            className="glyphicon glyphicon-edit"
            aria-hidden="true"
            title="Редактировать вопрос"
                             />}
        </div>
        <h3 className="katexable">{question.question}</h3>

        <div style={{position: 'relative'}}>
          {question.images && question.images.map((src, count) =>
            <div>
              <img src={src} key={count} style={
                {
                  // position: 'absolute relative',
                  // left: (imagesLeft.get(count) || 0) + 'px',
                  // top: (imagesTop.get(count) || 0) + 'px',
                  width: (question.imagesScale[count] || 400) + 'px',
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }
              }
              />
              <br />
            </div>
          )}
        </div>

        <ul>
          {
            question.answers.map((answer, key) =>
             (answer && (key < 1 || !question.isAnswerSymbolic)) && <li className="katexable" key={key}>{answer}</li>)
          }
        </ul>
      </div>
    )
  }

  inLectureNotFinished() {
    let {
      question,
      isStudent,
      onFinish,
      onAnswer,
      currentUserId,
      activeQuestion,
      showResult
    } = this.props

    let didCurrentUserAnswer = activeQuestion && activeQuestion.userAnswers
        .filter(({user}) => user === currentUserId).length === 1

    let correctAnswers = clone(question.correctAnswers).sort()
    let currentUserAnswer = []
    if (didCurrentUserAnswer) {
      currentUserAnswer = activeQuestion.userAnswers
        .filter(({user}) => user === currentUserId)[0].answer
      currentUserAnswer = clone(currentUserAnswer).sort()
    }

    return (
      <div className="container">
        <h3 className="katexable">{question.question}</h3>
        <form>
          {question.isAnswerSymbolic ?
            <Input
              value="123"
            />
          : question.answers.map((answer, key) =>
              <div key={key}>
                <Wrapper
                  showResult={showResult}
                  isFinished={didCurrentUserAnswer}
                  isCorrect={!!correctAnswers && correctAnswers.indexOf(key) > -1}
                  isFalse={!!correctAnswers && !!currentUserAnswer && correctAnswers.indexOf(key) === -1 && currentUserAnswer.indexOf(key) > -1}
                >
                <div style={{position: 'relative'}}>
                  {question.images && question.images.map((src, count) =>
                    <div>
                      <img src={src} key={count} style={
                        {
                          // position: 'absolute relative',
                          // left: (imagesLeft.get(count) || 0) + 'px',
                          // top: (imagesTop.get(count) || 0) + 'px',
                          width: (question.imagesScale[count] || 400) + 'px',
                          display: 'block',
                          marginLeft: 'auto',
                          marginRight: 'auto',
                        }
                      }
                      />
                      <br />
                    </div>
                  )}
                </div>
                  <Input
                    type={question.multiple ? 'checkbox' : 'radio'}
                    name="question"
                    onClick={el => this.onCheck(el.target.checked, key)}
                    id={`${answer}-input`}
                    disabled={didCurrentUserAnswer}
                    checked={didCurrentUserAnswer ? currentUserAnswer.indexOf(key) !== -1 : undefined}
                  />
                  <label htmlFor={`${answer}-input`} className="katexable">
                    {answer}
                  </label>
                </Wrapper>
              </div>
            )
          }
          {
            !isStudent && onFinish &&
            <Button type="button" bsStyle="danger" onClick={onFinish}>Завершить</Button>
          }
          {
            isStudent && !didCurrentUserAnswer &&
            <div>
              <Button type="button" bsStyle="success" onClick={() => onAnswer(this.state.checked)}>Ответить</Button>
              <Button style={{ marginLeft: '0.5em' }} type="button" bsStyle="success" onClick={() => onAnswer([])}>Пропустить</Button>
            </div>
          }
          {
            isStudent && didCurrentUserAnswer &&
            <Col xs={12} lg={4} md={4} sm={4}>
              <Button type="button" disabled>Ответить</Button>
              <Button style={{ marginLeft: '0.5em' }} type="button" disabled>Пропустить</Button>
              <br/>
              <br/>
              <Alert bsStyle="success">Ответ принят</Alert>
            </Col>
          }
        </form>
      </div>
    )
  }

  inLectureFinished() {
    let {question, activeQuestion} = this.props

    return (
      <div className="container">
        <h3 className="katexable">{question.question}</h3>
        <div style={{position: 'relative'}}>
          {question.images && question.images.map((src, count) =>
            <div>
              <img src={src} key={count} style={
                {
                  // position: 'absolute relative',
                  // left: (imagesLeft.get(count) || 0) + 'px',
                  // top: (imagesTop.get(count) || 0) + 'px',
                  width: (question.imagesScale[count] || 400) + 'px',
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }
              }
              />
              <br/>
            </div>
          )}
        </div>
        <p>Всего ответило: {activeQuestion.userAnswers.length}</p>
        <ul>
          {
            question.answers.map((answer, key) =>
              <li className="katexable" key={key}>
                {answer} — {activeQuestion.userAnswers.filter(({answer}) => answer.includes(key)).length}
              </li>
            )
          }
        </ul>
      </div>
    )
  }

  render() {
    if (!this.props.isActive) {
      return this.preview()
    }

    if (this.props.activeQuestion && this.props.activeQuestion.ended) {
      return this.inLectureFinished()
    }

    return this.inLectureNotFinished()
  }
}
