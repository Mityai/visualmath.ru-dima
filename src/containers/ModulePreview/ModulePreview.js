import React, {Component, PropTypes} from 'react'
import {asyncConnect} from 'redux-async-connect'
import {connect} from 'react-redux'
import {moduleImageSave} from 'redux/modules/modules'

import Helmet from 'react-helmet'
import Col from 'react-bootstrap/lib/Col'
import {Module, EditModule} from 'components'

import {getModuleById, loadSingle, activateEditMode, editName, editContent,
    editVisualModule, editModule, editImages} from 'redux/modules/modules'
import {STATUS_EDITING, STATUS_EDITING_SUCCESS, STATUS_EDITING_FAIL} from 'actions/modules'
import {load as loadVisualModules, getVisualModulesArray} from 'redux/modules/visualModules'

@asyncConnect([{
  deferred: true,
  promise: ({store: {getState, dispatch}, params: {moduleId}}) => {
    let module = getModuleById(getState(), moduleId)
    if (!module) {
      return dispatch(loadSingle(moduleId))
    }
  }
}, {
  deferred: false,
  promise: ({store: {dispatch}}) => {
    return Promise.all([
      dispatch(loadVisualModules()),
    ])
  }
}])
@connect(
  (state, {params: {moduleId}}) => ({
    module: getModuleById(state, moduleId),
    editingState: state.modules.editing,
    visualModules: getVisualModulesArray(state),
  }),
  {activateEditMode, editName, editContent, editVisualModule, editModule, moduleImageSave, editImages}
)
export default class ModulePreview extends Component {
  static propTypes = {
    module: PropTypes.object,
    activateEditMode: PropTypes.func.isRequired,
    editName: PropTypes.func.isRequired,
    editContent: PropTypes.func.isRequired,
    editModule: PropTypes.func.isRequired,
    editVisualModule: PropTypes.func.isRequired,
    editingState: PropTypes.object.isRequired,
    visualModules: PropTypes.any,
    moduleImageSave: PropTypes.func.isRequired,
    editImages: PropTypes.func.isRequired
  }

  editing() {
    let {editName, editContent, module, editModule, editVisualModule,
      visualModules, moduleImageSave, editImages} = this.props

    return (
      <div>
        <Col lg={6} md={6} sm={6} xs={6}>
          <EditModule module={module}
                      editName={name => editName(module._id, name)}
                      editContent={content => editContent(module._id, content)}
                      editVisualModule={visualModule =>
                        editVisualModule(module._id, visualModule)}
                      save={(name, content, visualModule, images, imagesLeft, imagesTop, imagesScale) =>
                        editModule(module._id,
                          {text: content, name, visualModule, images, imagesLeft, imagesTop, imagesScale})}
                      visualModules={visualModules}
                      upload={(file=>moduleImageSave(file))}
                      editImages={(images, imagesLeft, imagesTop, imagesScale)=>editImages(module._id, images, imagesLeft, imagesTop, imagesScale)}
          />
        </Col>
        <Col lg={6} md={6} sm={6} xs={6}>
          <Module module={this.props.module} showErrors editImages={(images, imagesLeft, imagesTop, imagesScale)=>editImages(module._id, images, imagesLeft, imagesTop, imagesScale)}
            save={(name, content, visualModule, images, imagesLeft, imagesTop, imagesScale) =>
                        editModule(module._id,
                          {text: content, name, visualModule, images, imagesLeft, imagesTop, imagesScale})} />
        </Col>
      </div>
    )
  }

  normalPreview() {
    return (
      <Col lg={6} lgOffset={3} md={8} mdOffset={2} sm={12} xs={12}>
        <Module module={this.props.module}
                activateEditMode={(id, isActive) => this.props.activateEditMode(id, isActive)}
                showEditButton
        />
      </Col>
    )
  }

  render() {
    let {module, editingState} = this.props

    return (
      <div className="container">
        <Helmet title="Предпросмотр"/>
        {editingState.status === STATUS_EDITING && editingState.id === module._id &&
        <div>
          <i className={'fa fa-cog fa-spin'}/>
        </div>
        }
        {editingState.status === STATUS_EDITING_SUCCESS && editingState.id === module._id &&
        <div className="text-success">
          Модуль сохранен
        </div>
        }
        {editingState.status === STATUS_EDITING_FAIL && editingState.id === module._id &&
        <div className="text-danger">
          {editingState.error}
        </div>
        }
        {
          module && module.isEditing ?
            ::this.editing() :
            ::this.normalPreview()
        }

      </div>
    )
  }
}
