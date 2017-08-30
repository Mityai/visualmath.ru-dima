import React, {Component, PropTypes} from 'react'
import cloneDeep from 'lodash/cloneDeep'

import {Alert, Input, Col} from 'react-bootstrap/lib'

import { AvailableQuestions, SortableModulesList } from 'components'

class EditBlock extends Component {
  state = {
    addedQuestions: this.props.selectedQuestions || [],
  }


  addQuestion(question) {
    let addedQuestions = cloneDeep(this.state.addedQuestions)
    if (addedQuestions.map(it => it._id).indexOf(question._id) !== -1) { // this questions already in the array
      return
    }
    addedQuestions.push(question)
    this.setState({addedQuestions})
  }

  render() {
    let {save, nameError, questions,
      editName, editQuestions, name} = this.props
    let {addedQuestions} = this.state
    console.log(addedQuestions)

    return (
      <div>
        <div className="container">
          <Col lg={4} md={4} sm={6} xs={6}>
            <Input type="textarea"
              style={{resize: 'none'}}
              placeholder="Название блока вопросов"
              value={name}
              onChange={({target: {value}}) => editName(value)}
            />
          </Col>
          <Col lg={6} md={6} sm={6} xs={6}>
            <button type="button" className="btn btn-primary"
              onClick={save}>
                Сохранить блок
            </button>
          </Col>
        </div>

        <div className="container">
          {
            nameError &&
            <Alert bsStyle={nameError ? 'danger' : null}>
              {nameError}
            </Alert>
          }
          <Col lg={6} md={6} sm={6} xs={6}>
            <AvailableQuestions
                modules={questions}
                selectedIds={addedQuestions.map(it => it._id)}
                onAdd={::this.addQuestion}/>
          </Col>
          <Col lg={6} md={6} sm={6} xs={6}>
            <SortableModulesList
              addedModules={addedQuestions}
              onChange={editQuestions}/>
          </Col>
        </div>
      </div>
    )
  }
}

EditBlock.propTypes = {
  nameError: PropTypes.object,
  name: PropTypes.string,
  questions: PropTypes.array,
  editName: PropTypes.func,
  editQuestions: PropTypes.func,
  save: PropTypes.func,
  selectedQuestions: PropTypes.array,
}

export default EditBlock
