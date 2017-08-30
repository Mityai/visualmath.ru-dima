import React, {PropTypes, Component} from 'react'
import {findDOMNode} from 'react-dom'
// import io from 'socket.io-client'

import compileKatex from 'utils/compileKatex'

export default class VisualModule extends Component {
  static propTypes = {
    // isStudent: PropTypes.bool,
    // isSynchronizationActive: PropTypes.bool,
    showEditButton: PropTypes.bool,
    showErrors: PropTypes.bool,
    activateEditMode: PropTypes.func,
    visualModule: PropTypes.any
  }

  defaultProps = {
    showEditButton: false,
    showErrors: true,
    activateEditMode: undefined,
    // isSynchronizationActive: false,
    // isStudent: true
  }

  state = {
    scriptName: ''
  }

  componentDidMount() {
    // TODO: Cause it's just preview of script, no need in dealing with
    // syncronization?

    // let {isSynchronizationActive, isStudent} = this.props
    //
    // let socket;
    // if (isSynchronizationActive) {
    //   socket = io(global.syncServer.domen, {path: global.syncServer.path});
    // }
    //
    // if (isSynchronizationActive &&
    //     !isStudent &&
    //     window &&
    //     window.OverContainer) {
    //   window.overContainer = new window.OverContainer('sender', socket)
    // } else if (isSynchronizationActive &&
    //     isStudent &&
    //     window &&
    //     window.OverContainer) {
    //   window.overContainer = new window.OverContainer('receiver', socket)
    // }

    compileKatex(findDOMNode(this))
    this.runScript()
  }


  componentWillReceiveProps(nextProps) {
    if (this.props.visualModule.script !== nextProps.visualModule.script) {
      try {
        let scriptName = nextProps.visualModule.script
                        .match(/Plotter\(["']{1}([a-zA-z0-9]+)["']{1}/m)[1] ||
                        nextProps.visualModule.script
                        .match(/PlotContainer\(["']{1}([a-zA-z0-9]+)["']{1}/m)[1]
        this.setState({scriptName}, this.runScript)
      } catch (exc) {
        // console.log('not valid script');
      }
    }
  }

  componentDidUpdate() {
    compileKatex(findDOMNode(this))
  }

  runScript() {
    let {showErrors} = this.props
    try {
      if (showErrors) {
        let errors = document.getElementsByClassName('visualModuleErrors')[0]
        errors.innerHTML = ''
      }
      eval(this.props.visualModule.script) // eslint-disable-line no-eval
    } catch (exc) {
      console.log(exc.message)
      if (showErrors) {
        let errors = document.getElementsByClassName('visualModuleErrors')[0]
        errors.innerHTML = 'Ошибка в визуальном модуле'
      }
    }
  }

  editVisualModule() {
    if (!this.props.activateEditMode) {
      return
    }

    this.props.activateEditMode(this.props.visualModule._id, true)
  }

  render() {
    let {visualModule: {name, description}, showEditButton, showErrors} = this.props;
    let styles = require('./VisualModule.scss');

    return (
      <div className={`${styles.visualModule}`}>
        {showErrors && <div className="visualModuleErrors"></div>}
        <div className={styles['edit-button']} onClick={() => this.editVisualModule()}>
          {showEditButton && <span
            className="glyphicon glyphicon-edit"
            aria-hidden="true"
            title="Редактировать визуальный модуль"
          />}
        </div>
        <h2 className="katexable">{name}</h2>
        <h3 className="katexable">{description}</h3>
        <div dangerouslySetInnerHTML={{__html: '<div id="plot"></div>' }}></div>
      </div>
    )
  }
}
