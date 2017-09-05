import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Input, Button, Glyphicon } from 'react-bootstrap'

import {default as Question} from '../Question/Question'

export class Block extends Component {
  render() {
    let questions = this.props.data.getIn(['content', 'questions'])

    return (
      <div style={{marginTop: '10px'}}>
        <div style={{display: 'flex'}}>
          <div style={{flex: 1}}>
            <Input type="textarea"
              style={{resize: 'none'}}
              placeholder="Название блока вопросов"
              value={this.props.data.get('name')}
              onChange={({target: {value}}) => this.props.setName(value)} />
          </div>
          <div style={{flex: 1, marginLeft: '5px'}}>
            <h2 className="katexable" style={{marginTop: 0}}>{this.props.data.get('name')}</h2>
          </div>
        </div>
        {
          questions.map((question, index) => {
            let questionId = question.get('_id')
            return (
              <div key={questionId}>
                {index !== questions.size - 1 && 
                  <Button onClick={() => this.props.deleteQuestionInBlock(questionId)}>
                    <Glyphicon glyph="remove" />Удалить вопрос
                  </Button>
                }
                <Question
                  question={question.get('name') || ''}
                  content={question}
                  {...this.props}
                  setName={name => this.props.setQuestionNameInBlock(questionId, name)}
                  setAnswer={(answerId, value) => this.props.setAnswer(questionId, answerId, value)}
                  checkCorrectAnswer={(answerId, value) => this.props.checkCorrectAnswer(questionId, answerId, value)}
                  toggleMultipleChoice={checked => this.props.toggleMultipleChoice(questionId, checked)}
                  makeAnswerSymbolic={(checked) => this.props.makeAnswerSymbolic(questionId, checked)}
                />
              </div>
            )
          })
        }
      </div>
    );
  }
}


Block.propTypes = {
  data: PropTypes.object.isRequired,
  setName: PropTypes.func.isRequired,

  setAnswer: PropTypes.func.isRequired,
  checkCorrectAnswer: PropTypes.func.isRequired,
  toggleMultipleChoice: PropTypes.func.isRequired,
  setQuestionNameInBlock: PropTypes.func.isRequired,
  deleteQuestionInBlock: PropTypes.func.isRequired,
  makeAnswerSymbolic: PropTypes.func.isRequired,
}

export function mapStateToProps() {
  return {}
}

export let bindFunctions = {
}

export default connect(mapStateToProps, bindFunctions)(Block)
