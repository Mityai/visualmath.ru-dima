import React, {Component, PropTypes} from 'react'
import {Alert, Input} from 'react-bootstrap/lib'

import {JSFileInputForm} from 'components'

export default class EditVisualModule extends Component {
  static propTypes = {
    editDescription: PropTypes.func.isRequired,
    editName: PropTypes.func.isRequired,
    editScript: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
    visualModule: PropTypes.any
  }

  constructor(props) {
    super(props)
  }

  state = {
    validationEnabled: false,
  }

  validateAndSave() {
    let {name, description, script} = this.props.visualModule

    if (name.length > 0 && description.length > 0 && script.length > 0) {
      this.props.save(name, description, script);
    } else {
      if (name.length === 0 || description.length === 0 || script.length === 0) {
        this.setState({validationEnabled: true})
      }
    }
  }

  validateVisualModuleName() {
    let {name} = this.props.visualModule
    if (!this.state.validationEnabled) {
      return null;
    }
    let length = name.length
    if (length === 0) return 'danger'
  }

  validateVisualModuleDescription() {
    let {description} = this.props.visualModule
    if (!this.state.validationEnabled) {
      return null;
    }
    let length = description.length
    if (length === 0) return 'danger'
  }

  render() {
    let {visualModule: {name, description}, editName, editDescription,
      editScript} = this.props
    let {validationEnabled} = this.state

    return (
      <div>
        <Input type="text"
          ref={ref => this.nameInput = ref}
          placeholder="Название визуального модуля"
          label="Название"
          value={name}
          onChange={(event) => editName(event.target.value)}
        />
        {
          validationEnabled && name.length === 0 &&
            <Alert bsStyle={this.validateVisualModuleName()}>
              Введите имя
            </Alert>
        }
        <Input type="text"
          ref={ref => this.descriptionInput = ref}
          placeholder="Описание визуального модуля"
          label="Описание"
          value={description}
          onChange={(event) => editDescription(event.target.value)}
        />
        {
          validationEnabled && description.length === 0 &&
          <Alert bsStyle={this.validateVisualModuleDescription()}>
            Введите описание
          </Alert>
        }
        <JSFileInputForm
          contentRead={editScript}
        />
        <button type="button"
                className="btn btn-primary"
                onClick={::this.validateAndSave}>
          Сохранить
        </button>
      </div>
    )
  }
}
