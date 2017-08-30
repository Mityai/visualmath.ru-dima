import React, {Component, PropTypes} from 'react'

import {connect} from 'react-redux'
import {asyncConnect} from 'redux-async-connect'
import {routeActions} from 'react-router-redux'

import {moduleImageSave} from 'redux/modules/modules'

import Helmet from 'react-helmet'
import {Col} from 'react-bootstrap/lib'

import {addModule} from 'redux/modules/modules'
import {load as loadVisualModules, getVisualModulesArray} from 'redux/modules/visualModules'

import {EditModule, Module} from 'components'

@asyncConnect([{
  deferred: false,
  promise: ({store: {dispatch}}) => {
    return Promise.all([
      dispatch(loadVisualModules()),
    ])
  }
}])
@connect(
  state => ({
    visualModules: getVisualModulesArray(state),
  }),
  {addModule, pushState: routeActions.push, moduleImageSave}
)

export default class AddModule extends Component {
  static propTypes = {
    addModule: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    visualModules: PropTypes.any.isRequired,
    moduleImageSave: PropTypes.func.isRequired
    // label: React.PropTypes.string,
  }


  state = {
    name: '',
    content: '',
    visualModule: {script: '', _id: ''},
    images: [],
    imagesLeft: [],
    imagesTop: [],
    imagesScale: []
  }

  render() {
    let {pushState, addModule, visualModules, moduleImageSave} = this.props
    let editModuleProps = {
      module: {
        name: this.state.name,
        content: this.state.content,
        courses: ['Матанализ', 'Диффуры', 'Линал'],
        visualModule: this.state.visualModule,
        images: this.state.images,
        imagesLeft: this.state.imagesLeft,
        imagesTop: this.state.imagesTop,
        imagesScale: this.state.imagesScale
      },
      visualModules: visualModules,
      editContent: (content, caretStart, caretEnd) => {
        this.setState({content}, () => {
          if (typeof caretStart !== 'undefined' && typeof caretEnd !== 'undefined') {
            let editModule = document.getElementById('editModule')
            editModule.focus()
            editModule.setSelectionRange(caretStart, caretEnd)
          }
        })
      },
      editName: (name) => this.setState({name}),
      editVisualModule: visualModule => this.setState({visualModule}),
      // onImageUpload: (images) => this.setState({images}),
      save: (name, content, visualModule, images, imagesLeft, imagesTop, imagesScale) => addModule(name, content, visualModule, images, imagesLeft, imagesTop, imagesScale)
                                    .then(() => pushState('/addModuleSuccess')),
      upload: file=>moduleImageSave(file),
      editImages: (images, imagesLeft, imagesTop, imagesScale)=>this.setState({images, imagesLeft, imagesTop, imagesScale})
    }

    let moduleProps = {
      name: this.state.name,
      content: this.state.content,
      visualModule: this.state.visualModule,
      images: this.state.images,
      imagesLeft: this.state.imagesLeft,
      imagesTop: this.state.imagesTop,
      imagesScale: this.state.imagesScale
    }

    return (
      <div className="container">
        <Helmet title="Добавить модуль"/>
      <h2> Добавление модуля </h2>
        <Col lg={6} md={6} sm={6} xs={6}>
          <EditModule {...editModuleProps} />
        </Col>
        <Col lg={5} md={5} sm={5} xs={5}>
          <Module module={moduleProps}
                  editImages= {(images, imagesLeft, imagesTop, imagesScale)=>this.setState({images, imagesLeft, imagesTop, imagesScale})}/>
        </Col>
      </div>
    )
  }
}
