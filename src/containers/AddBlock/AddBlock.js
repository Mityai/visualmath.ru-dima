import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { asyncConnect } from 'redux-async-connect'

import Helmet from 'react-helmet'
import { EditBlock } from 'components'

import {list as questionsList} from 'redux/modules/questions'
import {add as addBlock} from 'redux/modules/questionBlocks'

@asyncConnect([{
  deferred: false,
  promise: ({store: {dispatch}}) => dispatch(questionsList())
}])
@connect(
  state => ({
    questions: Object.values(state.questions.list)
  }),
  { addBlock }
)
export default class AddBlock extends Component {
  static propTypes = {
    questions: PropTypes.array,
    addBlock: PropTypes.func.isRequired
  }

  state = {
    blockName: '',
    nameError: null,
    questions: []
  }

  save() {
    this.props.addBlock(this.state.questions.map(it => it._id), this.state.blockName)
      .then(() => console.log('added'))
      .catch(error => console.error(error))
  }

  render() {
    let { nameError } = this.state

    return (
      <div className="container">
        <Helmet title="Создать блок вопросов"/>
        <h1 style={{fontSize: '1.2em'}}>Создать блок вопросов</h1>

        <EditBlock
          name={this.state.blockName}
          questions={this.props.questions}
          nameError={nameError}
          editName={value => this.setState({ blockName: value, nameError: null })}
          editQuestions={questions => {
            console.log('change')
            console.log(questions)
            this.setState({ questions })
          }}
          save={::this.save}
        />
      </div>
    )
  }
}
