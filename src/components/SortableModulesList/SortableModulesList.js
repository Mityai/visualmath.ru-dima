import React, {Component, PropTypes} from 'react'
import cloneDeep from 'lodash/cloneDeep'

import Table from 'react-bootstrap/lib/Table'
import {findDOMNode} from 'react-dom'
import compileKatex from 'utils/compileKatex'
// import {Link} from 'react-router';

// import {getModules, findModule} from 'redux/modules/modules';

class SortableModulesList extends Component {
  static propTypes = {
    modules: PropTypes.array,
    onChange: PropTypes.func,
    addedModules: PropTypes.array,
    title: PropTypes.string
  }

  static defaultProps = {
    modules: []
  }

  state = {
    modules: this.props.modules
  }

  componentDidMount() {
    compileKatex(findDOMNode(this))
  }

  componentWillReceiveProps(newProps) {
    let containedIds = this.state.modules.map(it => it._id)
    let newModules = newProps.addedModules.filter(it => containedIds.indexOf(it._id) === -1)
    let modules = cloneDeep(this.state.modules)

    newModules.forEach(module => modules.push(module))
    this.setState({modules})

    if (newModules.length > 0) {
      this.handleSort(modules)
    }
  }

  componentDidUpdate() {
    compileKatex(findDOMNode(this))
  }

  handleSort(modules) {
    let modulesToSend = Array.isArray(modules) ? modules : this.state.modules
    if (this.props.onChange) {
      this.props.onChange(modulesToSend)
    }
  }

  render() {
    const modules = this.state.modules.map(moduleOrQuestion => {
      let title
      if (!!moduleOrQuestion.name) {
        title = moduleOrQuestion.name
      } else {
        title = moduleOrQuestion.question
      }
      return (
        <tr key={moduleOrQuestion._id}>
          <td className="katexable">{title}</td>
        </tr>
      )
    })

    return (
      <div>
        <Table>
          <thead>
          <tr>
            <th>{this.props.title}</th>
          </tr>
          </thead>
          <tbody ref="list">
          {
            modules.length > 0 && modules
          }
          {
            modules.length === 0 &&
            <tr>
              <td>В лекции еще нет ни одного модуля. Перетащите их сюда!</td>
            </tr>
          }
          </tbody>
        </Table>
      </div>
    )
  }
}

const sortableOptions = {
  ref: 'list',
  model: 'modules',
  animation: 150,
  ghostClass: 'item-ghost',
  group: 'shared'
}

if (__CLIENT__) {
  let sortable = require('react-sortablejs').default
  module.exports = sortable(sortableOptions)(SortableModulesList)
} else {
  module.exports = SortableModulesList
}
