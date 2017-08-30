import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import cloneDeep from 'lodash/cloneDeep'

import Input from 'react-bootstrap/lib/Input'
import Alert from 'react-bootstrap/lib/Alert'
import Col from 'react-bootstrap/lib/Col'
import { SortableModulesList, AvailableModules, AvailableQuestions, Tabs, AvailableBlocks } from 'components'

import { asyncConnect } from 'redux-async-connect'
import { load as loadModules, getModulesArray } from 'redux/modules/modules'
import { addLecture } from 'redux/modules/lectures'
import { list as questionsList } from 'redux/modules/questions'
import { list as questionBlocksList, getArray as getQuestionBlocksArray} from 'redux/modules/questionBlocks'
import { routeActions } from 'react-router-redux'

@asyncConnect([{
  deferred: false,
  promise: ({store: {dispatch}}) => {
    return Promise.all([
      dispatch(loadModules()), 
      dispatch(questionsList()),
      dispatch(questionBlocksList())
    ])
  }
}])
@connect(
  state => ({
    modules: getModulesArray(state),
    questions: Object.values(state.questions.list),
    questionBlocks: getQuestionBlocksArray(state)
  }),
  { 
    addLecture, 
    pushState: routeActions.push 
  }
)
export default class AddLecture extends Component {
  static propTypes = {
    addLecture: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    modules: PropTypes.array.isRequired,
    questions: PropTypes.array.isRequired,
    questionBlocks: PropTypes.array.isRequired
  };

  state = {
    lectureName: '',
    modules: [],
    questions: [],
    blocks: [],
    mapping: [],
    addedModules: []
  };

  send() {
    let {lectureName, modules, questions, questionBlocks, mapping} = this.state;
    let {addLecture, pushState} = this.props;

    if (lectureName.length > 0) {
      addLecture(lectureName, modules, questions, questionBlocks, mapping).then(() => pushState('/addLectureSuccess'));
    } else {
      this.setState({validationEnabled: true});
    }
  }

  validateLectureName() {
    if (!this.state.validationEnabled) {
      return null;
    }
    let length = this.state.lectureName.length;
    if (length === 0) return 'danger';
  }

  addModule(module) {
    let addedModules = cloneDeep(this.state.addedModules)
    if (addedModules.map(it => it._id).indexOf(module._id) !== -1) { // this module already in the array
      return
    }
    addedModules.push(module)
    this.setState({addedModules})
  }

  render() {
    let {validationEnabled} = this.state

    return (
      <div>
        <div className="container">
          <Helmet title="Создать лекцию"/>
          <h1 style={{fontSize: '1.2em'}}>Создать лекцию</h1>
          <Col lg={4} md={4} sm={6} xs={6}>
            <Input type="textarea"
              style={{resize: 'none'}}
              placeholder="Название лекции"
              onChange={({target}) => this.setState({ lectureName: target.value })}
            />
          </Col>
          <Col lg={6} md={6} sm={6} xs={6}>
            <button type="button" className="btn btn-primary" onClick={::this.send}>Создать лекцию</button>
          </Col>
        </div>
        <div className="container">
          {
            validationEnabled && this.state.lectureName.length === 0 &&
            <Alert bsStyle={this.validateLectureName()}>
              Введите имя
            </Alert>
          }
          <Col lg={6} md={6} sm={6} xs={6}>
            <Tabs names={['Модули', 'Вопросы', 'Блоки вопросов']}>
              <AvailableModules
                modules={this.props.modules}
                onAdd={::this.addModule}/>
              <AvailableQuestions
                modules={this.props.questions}
                onAdd={::this.addModule}/>
              <AvailableBlocks
                defaultName="Безымянный блок"
                modules={this.props.questionBlocks}
                onAdd={::this.addModule}/>
            </Tabs>
          </Col>
          <Col lg={6} md={6} sm={6} xs={6}>
            <SortableModulesList
              addedModules={this.state.addedModules}
              onChange={modulesAndQuestions =>
                this.setState({
                  modules: modulesAndQuestions
                    .filter(moduleOrQuestion => !!moduleOrQuestion.name),

                  questions: modulesAndQuestions
                    .filter(moduleOrQuestion => !!moduleOrQuestion.question),

                  questionBlocks: modulesAndQuestions
                    .filter(moq => !!moq.questionsIds),

                  mapping: modulesAndQuestions.map((() => {
                    let moduleInd = 0
                    let questionInd = 0
                    let blocksInd = 0

                    function type(moq) {
                      if (moq.questionsIds) {
                        return 'questionBlock'
                      }

                      return !!moq.name ? 'module' : 'question'
                    }

                    function index(moq) {
                      if (moq.questionsIds) {
                        return blocksInd++
                      }

                      return !!moq.name ? moduleInd++ : questionInd++
                    }

                    return moq => ({
                      type: type(moq),
                      index: index(moq)
                    });
                  })())
                })
              }
            />
          </Col>
        </div>
      </div>
    );
  }
}
