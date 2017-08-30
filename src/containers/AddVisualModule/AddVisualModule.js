import React, {Component, PropTypes} from 'react'

import {connect} from 'react-redux'
// import {routeActions} from 'react-router-redux'
import {addVisualModule} from 'redux/modules/visualModules'

import {Col} from 'react-bootstrap/lib'
import Helmet from 'react-helmet'

import {EditVisualModule, VisualModule} from 'components'

@connect(
  (state, props) => props,
  {addVisualModule, /* pushState: routeActions.push */}
)

export default class AddVisualModule extends Component {
  static propTypes = {
    addVisualModule: PropTypes.func.isRequired,
    // pushState: PropTypes.func.isRequired,
  }

  state = {
    name: '',
    description: '',
    script: '',
  }

  render() {
    let {/* pushState, */ addVisualModule} = this.props
    let editModuleProps = {
      visualModule: {
        name: this.state.name,
        description: this.state.description,
        script: this.state.script,
      },
      editName: (name) => this.setState({name}),
      editDescription: (description) => this.setState({description}),
      editScript: (script) => this.setState({script}),
      save: (name, description, script) => addVisualModule(name, description,
                                                          script),
                                    // .then(() => pushState('/addModuleSuccess'))
    }

    let visualModuleProps = {
      name: this.state.name,
      description: this.state.description,
      script: this.state.script,
    }

    return (
      <div className="container">
        <Helmet title="Добавить визуальный модуль"/>
        <h2> Добавление визуального модуля </h2>

        <Col lg={6} md={6} sm={6} xs={6}>
          <EditVisualModule {...editModuleProps} />
        </Col>

        <Col lg={6} md={6} sm={6} xs={6}>
          <VisualModule visualModule={visualModuleProps} />
        </Col>
      </div>
    )
  }
}
