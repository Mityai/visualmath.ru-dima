import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import clone from 'lodash/clone';

import Helmet from 'react-helmet';
import Col from 'react-bootstrap/lib/Col';

import {moduleImageSave} from 'redux/modules/modules'
import {addQuestion} from 'redux/modules/questions';
import {routeActions} from 'react-router-redux';

import {EditQuestion, Question} from 'components'

@connect(
  (state, props) => props,
  {addQuestion, moduleImageSave, pushState: routeActions.push}
)
export default class AddQuestion extends Component {
  static propTypes = {
    addQuestion: PropTypes.func.isRequired,
    moduleImageSave: PropTypes.func,
    pushState: PropTypes.func.isRequired
  };

  state = {
    question: '',
    answers: [''],
    multiple: false,
    correctAnswers: [],
    images: [],
    imagesLeft: [],
    imagesTop: [],
    imagesScale: [],
    isAnswerSymbolic: false
  };

  save() {
    let {question, answers, correctAnswers, multiple, images, imagesLeft, imagesTop, imagesScale, isAnswerSymbolic} = this.state;
    if (answers[answers.length - 1] === '') {
      answers.pop();
    }
    this.props.addQuestion({question, answers, correctAnswers, multiple, images, imagesLeft, imagesTop, imagesScale, isAnswerSymbolic})
      .then(() => this.props.pushState('/addQuestionSuccess'));
  }

  answerChange(value, id) {
    let answers = clone(this.state.answers);
    answers[id] = value;

    if (id === answers.length - 1 && !this.state.isAnswerSymbolic) {
      answers.push('');
    }

    if (value === '') {
      let correctAnswers = clone(this.state.correctAnswers);
      let index = correctAnswers.indexOf(id);
      if (index > -1) {
        correctAnswers.splice(index, 1);
      }

      this.setState({correctAnswers});
    }

    if (id === answers.length - 2 && value === '' && answers[answers.length - 1] === '') {
      let correctAnswers = clone(this.state.correctAnswers);
      let index = correctAnswers.indexOf(answers.length - 1);
      if (index > -1) {
        correctAnswers.splice(index, 1);
      }

      answers.pop();
    }

    this.setState({answers});
  }

  editCorrectAnswers(checked, id) {
    let correctAnswers = clone(this.state.correctAnswers);
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

    this.setState({correctAnswers});
  }

  render() {
    let question = {
      question: this.state.question,
      images: this.state.images,
      imagesLeft: this.state.imagesLeft,
      imagesTop: this.state.imagesTop,
      imagesScale: this.state.imagesScale,
      answers: this.state.answers,
      correctAnswers: this.state.correctAnswers,
      multiple: this.state.multiple,
      isAnswerSymbolic: this.state.isAnswerSymbolic
    }

    return (
      <div className="container">
        <Helmet title="Добавить вопрос"/>
        <h1>Добавить вопрос</h1>
          <Col lg={6} md={6} sm={6} xs={6}>
            <EditQuestion
              question={question}
              editQuestionText={value => this.setState({question: value})}
              editAnswers={(value, id) => this.answerChange(value, id)}
              editImages={({images, imagesLeft, imagesTop, imagesScale}) => 
                this.setState({images, imagesLeft, imagesTop, imagesScale})}
              editCorrectAnswers={(checked, id) => this.editCorrectAnswers(checked, id)}
              upload={file => this.props.moduleImageSave(file)}
              setAnswerSymbolic={(isAnswerSymbolic) => this.setState({isAnswerSymbolic})}
              save={::this.save}
            />
          </Col>

          <Col lg={6} md={6} sm={6} xs={6}>
            <Question
              question={question}
            />
          </Col>
      </div>
    );
  }
}
