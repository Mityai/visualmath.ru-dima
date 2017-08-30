import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import {
  createSlide,
} from '../../../redux/modules/lectureConstructor'

let styles = require('./Slide.scss')

export class NewSlide extends Component {
  state = {
    selectMode: false,
  }

  getSlideStyle() {
    return {
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      padding: '10px',
      marginTop: '10px',
      position: 'relative',
      cursor: 'default',
      width: '50%',
    }
  }

  createSlide(type) {
    this.props.createSlide(type)
    this.toggleSelect()
  }

  toggleSelect() {
    this.setState({
      selectMode: !this.state.selectMode,
    })
  }

  render() {
    let selectList = null
    if (this.state.selectMode) {
      selectList = (
        <div
          onClick={ev => ev.stopPropagation()}
          style={{
            zIndex: 3,
            width: '150px',
            position: 'absolute',
            left: '102%',
            top: '5px',
          }}>
          <div onClick={() => this.createSlide('text')}
            className={`${styles['select-element']} ${styles['select-element-text']}`}>
            Текстовый модуль
          </div>
          <div onClick={() => this.createSlide('question')}
            className={`${styles['select-element']} ${styles['select-element-question']}`}>
            Вопрос
          </div>
          <div onClick={() => this.createSlide('block')}
            className={`${styles['select-element']} ${styles['select-element-block']}`}>
            Проверочный блок
          </div>
        </div>
      )
    }

    return (
      <div>
        <div
          onClick={() => this.toggleSelect()}
          style={this.getSlideStyle()}>
          {'Нажмите, чтобы выбрать контент'}
          {selectList}
        </div>
      </div>
    )
  }
}

NewSlide.propTypes = {  
  // bind functions
  createSlide: PropTypes.func.isRequired,
}

export function mapStateToProps() {
  return {}
}

export let bindFunctions = {
  createSlide,
}

export default connect(mapStateToProps, bindFunctions)(NewSlide)
