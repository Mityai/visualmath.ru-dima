import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom'
import {asyncConnect} from 'redux-async-connect';
import {connect} from 'react-redux';

import Helmet from 'react-helmet';
import {Col} from 'react-bootstrap/lib'

import {EditBlock, Question} from 'components'

import {list as questionsList} from 'redux/modules/questions'
import {loadSingle as loadQuestionBlock,
  getExpanded as getQuestionBlockExpanded,
  editName, editQuestions, editQuestionBlock,
  activateEditMode} from 'redux/modules/questionBlocks';
import {STATUS_EDITING, STATUS_EDITING_SUCCESS, STATUS_EDITING_FAIL} from 'actions/questionBlocks'

import compileKatex from 'utils/compileKatex'

@asyncConnect([{
  promise: ({store: {getState, dispatch}, params: {questionBlockId}}) => {
    let questionBlock = getState().questionBlocks.list[questionBlockId];
    if (!questionBlock) {
      return dispatch(loadQuestionBlock(questionBlockId))
    }
  }
},
{
  deferred: false,
  promise: ({store: {dispatch}}) => dispatch(questionsList())
}])
@connect(
  (state, {params: {questionBlockId}}) => ({
    questionBlock: getQuestionBlockExpanded(state, questionBlockId) || {},
    editingState: state.questionBlocks.editing,
    questions: Object.values(state.questions.list)
  }),
  {activateEditMode, editName, editQuestions, editQuestionBlock}
)
class QuestionBlockPreview extends Component {
  componentDidMount() {
    compileKatex(findDOMNode(this))
  }

  editing() {
    let {editQuestions, editName, questionBlock} = this.props

    return (
      <div>
        <EditBlock
          questions={this.props.questions}
          name={questionBlock.name}
          selectedQuestions={questionBlock.questions}
          nameError={null}
          editName={value => editName(questionBlock._id, value)}
          editQuestions={questions =>
            editQuestions(questionBlock._id, questions.map(it => it._id))
          }
          save={() =>
            this.props.editQuestionBlock(questionBlock._id,
              {questions: questionBlock.questions.map(it => it._id),
              name: questionBlock.name})
          }
        />
      </div>
    )
  }

  normalPreview() {
    let styles = require('./QuestionBlockPreview.scss');
    return (
      <Col lg={6} lgOffset={3} md={8} mdOffset={2} sm={12} xs={12}>
        <div className={styles['edit-button']}
          onClick={() =>
            this.props.activateEditMode(
              this.props.questionBlock._id, true)}>
          <span
            className="glyphicon glyphicon-edit"
            aria-hidden="true"
            title="Редактировать вопрос"
                             />
        </div>

        {this.props.questionBlock.questions.map((question, index) =>
            <Question key={index} question={question} />
        )}
      </Col>
    )
  }

  render() {
    let questions = this.props.questionBlock
    let {editingState} = this.props
    return (
      <div className="container">
        <Helmet title="Предпросмотр блока вопроса"/>
        {editingState.status === STATUS_EDITING && editingState.id === questions._id &&
        <div>
          <i className={'fa fa-cog fa-spin'}/>
        </div>
        }
        {editingState.status === STATUS_EDITING_SUCCESS && editingState.id === questions._id &&
        <div className="text-success">
          Блок вопросов сохранен
        </div>
        }
        {editingState.status === STATUS_EDITING_FAIL && editingState.id === questions._id &&
        <div className="text-danger">
          {editingState.error}
        </div>
        }
        {
          questions.isEditing ?
            ::this.editing() :
            ::this.normalPreview()
        }
      </div>
    )
  }
}

QuestionBlockPreview.propTypes = {
  questionBlock: PropTypes.object,
  editingState: PropTypes.object,
  editName: PropTypes.func,
  editQuestions: PropTypes.func,
  editQuestionBlock: PropTypes.func,
  activateEditMode: PropTypes.func,
  questions: PropTypes.array,
}

export default QuestionBlockPreview
