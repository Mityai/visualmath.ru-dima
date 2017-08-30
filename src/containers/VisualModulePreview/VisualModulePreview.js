import React, {Component, PropTypes} from 'react'
import {asyncConnect} from 'redux-async-connect'
import {connect} from 'react-redux'

import Helmet from 'react-helmet'
import Col from 'react-bootstrap/lib/Col'
import {EditVisualModule, VisualModule} from 'components'

import {getVisualModuleById, loadSingle, activateEditMode, editName,
  editDescription, editScript, editVisualModule}
    from 'redux/modules/visualModules'
import {STATUS_EDITING, STATUS_EDITING_SUCCESS, STATUS_EDITING_FAIL} from 'actions/visualModules'

@asyncConnect([{
  deferred: true,
  promise: ({store: {getState, dispatch}, params: {visualModuleId}}) => {
    let visualModule = getVisualModuleById(getState(), visualModuleId)
    if (!visualModule) {
      return dispatch(loadSingle(visualModuleId))
    }
  }
}])
@connect(
  (state, {params: {visualModuleId}}) => ({
    visualModule: getVisualModuleById(state, visualModuleId),
    editingState: state.visualModules.editing
  }),
  {activateEditMode, editName, editDescription, editScript, editVisualModule}
)
export default class VisualModulePreview extends Component {
  static propTypes = {
    visualModule: PropTypes.object,
    activateEditMode: PropTypes.func.isRequired,
    editName: PropTypes.func.isRequired,
    editDescription: PropTypes.func.isRequired,
    editScript: PropTypes.func.isRequired,
    editVisualModule: PropTypes.func.isRequired,
    editingState: PropTypes.object.isRequired
  }

  editing() {
    let {editName, editDescription, editScript, visualModule,
      editVisualModule} = this.props

    return (
      <div>
        <Col lg={6} md={6} sm={6} xs={6}>
          <EditVisualModule visualModule={visualModule}
                      editName={name => editName(visualModule._id, name)}
                      editDescription={desc => editDescription(visualModule._id, desc)}
                      editScript={script => editScript(visualModule._id, script)}
                      save={(name, description, script) =>
                        editVisualModule(visualModule._id, {name, description,
                          script})}
          />
        </Col>
        <Col lg={6} md={6} sm={6} xs={6}>
          <VisualModule visualModule={this.props.visualModule} showErrors/>
        </Col>
      </div>
    )
  }

  normalPreview() {
    return (
      <Col lg={6} lgOffset={3} md={8} mdOffset={2} sm={12} xs={12}>
        <VisualModule visualModule={this.props.visualModule}
                activateEditMode={(id, isActive) => this.props.activateEditMode(id, isActive)}
                showEditButton
        />
      </Col>
    )
  }

  render() {
    let {visualModule, editingState} = this.props

    return (
      <div className="container">
        <Helmet title="Предпросмотр"/>
        {editingState.status === STATUS_EDITING && editingState.id === visualModule._id &&
        <div>
          <i className={'fa fa-cog fa-spin'}/>
        </div>
        }
        {editingState.status === STATUS_EDITING_SUCCESS && editingState.id === visualModule._id &&
        <div className="text-success">
          Визуальный модуль сохранен
        </div>
        }
        {editingState.status === STATUS_EDITING_FAIL && editingState.id === visualModule._id &&
        <div className="text-danger">
          {editingState.error}
        </div>
        }
        {
          visualModule.isEditing ?
            ::this.editing() :
            ::this.normalPreview()
        }

      </div>
    )
  }
}
