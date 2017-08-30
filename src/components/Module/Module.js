import React, {PropTypes, Component} from 'react'
import {findDOMNode} from 'react-dom'
import io from 'socket.io-client'

import compileKatex from 'utils/compileKatex'

export default class Module extends Component {
  static propTypes = {
    isStudent: PropTypes.bool,
    isSynchronizationActive: PropTypes.bool,
    showEditButton: PropTypes.bool,
    showErrors: PropTypes.bool,
    activateEditMode: PropTypes.func,
    module: PropTypes.any,
    editImages: PropTypes.any,
    save: PropTypes.any
  }

  defaultProps = {
    showEditButton: false,
    showErrors: false,
    activateEditMode: undefined,
    isSynchronizationActive: false,
    isStudent: true,
    imageDataChanged: true
  }


  componentDidMount() {
    let {isSynchronizationActive, isStudent} = this.props

    let socket;
    if (isSynchronizationActive) {
      socket = io(global.syncServer.domen, {path: global.syncServer.path});
    }

    if (isSynchronizationActive &&
        !isStudent &&
        window &&
        window.OverContainer) {
      window.overContainer = new window.OverContainer('sender', socket)
    } else if (isSynchronizationActive &&
        isStudent &&
        window &&
        window.OverContainer) {
      window.overContainer = new window.OverContainer('receiver', socket)
    }

    let escapeRegExp = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/gm, '\\$1')

    this.textPreprocess = (text) => {
      let {images} = this.props.module
      let script
      if (this.props.module.visualModule) {
        script = this.props.module.visualModule.script
      } else {
        script = ''
      }

      let preprocessed = text

      if (typeof images !== 'undefined') {
        Object.keys(images).forEach((src) =>
        preprocessed = preprocessed.replace(new RegExp(escapeRegExp(images[src]), 'g'), src))
      }

      if (script) {
        try {
          let scriptName = script.match(/Plotter\(["']{1}([a-zA-z0-9]+)["']{1}/m)[1] ||
          script.match(/PlotContainer\(["']{1}([a-zA-z0-9]+)["']{1}/m)[1]
          preprocessed = preprocessed.replace(/\\moduleLink/mg, "<div id='" +
          scriptName + "'></div>")
        } catch (exc) {
          // no visual module yet, default agreement
          preprocessed = preprocessed.replace(/\\moduleLink/mg, "<div id='visualmath'></div>")
        }
      }

      return preprocessed;
    }

    compileKatex(findDOMNode(this), this.textPreprocess)
    this.runScript()
  }

  componentDidUpdate() {
    compileKatex(findDOMNode(this), this.textPreprocess)
    this.runScript()
  }

  runScript() {
    let {showErrors} = this.props
    try {
      if (showErrors) {
        let errors = document.getElementsByClassName('moduleErrors')[0]
        errors.innerHTML = ''
      }
      if (this.props.module.visualModule) {
        eval(this.props.module.visualModule.script) // eslint-disable-line no-eval
      } else if (this.props.module.script) {
        eval(this.props.module.script) // eslint-disable-line no-eval
      }
    } catch (exc) {
      if (showErrors) {
        console.log(exc);
        let errors = document.getElementsByClassName('moduleErrors')[0]
        if (exc.includes('Не найден элемент с указанным ID')) {
          errors.innerHTML = 'Добавьте модуль с помощью \\moduleLink'
        } else {
          errors.innerHTML = 'Ошибка в визуальном модуле'
        }
      }
    }
  }

  editModule() {
    if (!this.props.activateEditMode) {
      return
    }

    this.props.activateEditMode(this.props.module._id, true)
  }

  render() {
    if (this.props.module) {
      let {module: {content, /* visualModule, */ name, images, imagesLeft, imagesTop, imagesScale}, showEditButton, showErrors, editImages  /* , save */} = this.props;
      let styles = require('./Module.scss');
      let editing = typeof editImages === 'function';
      let leftOffset = 0;
      let topOffset = 0;
      let leftBeforeDrag;
      let topBeforeDrag;
      let drag = false;
      return (
        <div className={`${styles.module}`}>
          {showErrors && <div className={"moduleErrors"}></div>}
          <div className={styles['edit-button']} onClick={() => this.editModule()}>
            {showEditButton && <span
              className="glyphicon glyphicon-edit"
              aria-hidden="true"
              title="Редактировать модуль"
            />}
          </div>
          <h2 className="katexable">{name}</h2>
          <div className="katexable" dangerouslySetInnerHTML={{__html: content}}></div>
          <div style={{position: 'relative'}}>
            {images && images.map((src, count, imgs)=>
              <div>
                <img src={src} key={count} style={
                  {
                    // position: 'absolute',
                    // left: (imagesLeft[count] || 0) + 'px',
                    // top: (imagesTop[count] || 0) + 'px',
                    width: (imagesScale[count] || 400) + 'px',
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }
                } onMouseDown={
                    editing ?
                    (event)=>{
                      event.preventDefault()
                      leftOffset = event.clientX;
                      topOffset = event.clientY;
                      leftBeforeDrag = imagesLeft[count];
                      topBeforeDrag = imagesTop[count];
                      drag = true;
                    }
                    : ()=>{}
                } onMouseMove={
                  editing ?
                  ({clientX, clientY, target})=>{
                    if (drag) {
                      imagesLeft[count] = leftBeforeDrag - leftOffset + clientX;
                      imagesTop[count] = topBeforeDrag - topOffset + clientY;
                      target.style.left = imagesLeft[count] + 'px';
                      target.style.top = imagesTop[count] + 'px';
                    }
                  }
                  : ()=>{}
                } onMouseUp={
                  editing ?
                  ()=>{
                    if (drag) {
                      drag = false;
                      editImages(imgs, imagesLeft, imagesTop, imagesScale)
                    }
                  }
                  : ()=>{}
                }
                />
              </div>
            )}
          </div>
        </div>
      )
    }
    return null;
  }
}
