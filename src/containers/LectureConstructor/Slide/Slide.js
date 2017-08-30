import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { KatexableComponent } from '../../../utils/katexable'

import { Glyphicon } from 'react-bootstrap'
import { Block } from './Block/Block'
import { Text } from './Text/Text'
import { Question } from './Question/Question'


import {
  createSlide,
} from '../../../redux/modules/lectureConstructor'

import {
  moduleImageSave as saveImages
} from 'redux/modules/modules'

let styles = require('./Slide.scss')

export function mapStateToProps() {
  return {}
}

export let bindFunctions = {
  createSlide,
  saveImages
}

export class Slide extends KatexableComponent {
  state = {
    selectMode: false,
  }

  getSlideStyle() {
    let color = {}
    let type = this.props.data.get('type')
    if (type === 'text') {
      color = {
        backgroundColor: '#D0A283'
      }
    } else if (type === 'question') {
      color = {
        backgroundColor: '#FBADD2'
      }
    } else if (type === 'block') {
      color = {
        backgroundColor: '#FFD8B0'
      }
    }

    return Object.assign(color, {
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      padding: '10px',
      marginTop: '10px',
      position: 'relative',
      cursor: 'default',
      width: '50%',
    })
  }

  getSlideTitle() {
    let type = this.props.data.get('type')
    let name = this.props.data.get('name')
    if (type === 'text') {
      return name || 'Текстовый модуль'
    } else if (type === 'question') {
      return name || 'Вопрос'
    } else if (type === 'block') {
      return name || 'Блок'
    }

    return 'Слайд выбран'
  }

  setSlideType(type) {
    this.props.setSlideType(type)
    this.toggleSelect()
  }

  isExpanded() {
    return this.props.data.getIn(['__state__', 'expanded'])
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
            width: '150px',
            position: 'absolute',
            left: '102%',
            top: '5px'
          }}>
          <div onClick={() => this.setSlideType('text')}
            className={`${styles['select-element']} ${styles['select-element-text']}`}>
            Текстовый модуль
          </div>
          <div onClick={() => this.setSlideType('question')}
            className={`${styles['select-element']} ${styles['select-element-question']}`}>
            Вопрос
          </div>
          <div onClick={() => this.setSlideType('block')}
            className={`${styles['select-element']} ${styles['select-element-block']}`}>
            Проверочный блок
          </div>
          <div className={`${styles['select-element']} ${styles['select-element-delete']}`} 
            onClick={() => this.props.remove()}>
              <Glyphicon glyph="remove" />
                Удалить слайд
          </div>
        </div>
      )
    }

    let editor = null
    let data = this.props.data
    let content = data.get('content')
    if (this.isExpanded() && data.get('type') === 'text') {
      editor = (<Text {...this.props} text={content.get('text')} name={data.get('name')} 
                  images={content.get('images')} imagesLeft={content.get('imagesLeft')}
                  imagesTop={content.get('imagesTop')} imagesScale={content.get('imagesScale')} />)
    } else if (this.isExpanded() && data.get('type') === 'question') {
      editor = <Question {...this.props} question={data.get('name')} content={content} />
    } else if (this.isExpanded() && data.get('type') === 'block') {
      editor = <Block {...this.props} />
    }

    return (
      <div>
        <div style={this.getSlideStyle()}>
          <Glyphicon glyph={this.isExpanded() ? 'arrow-up' : 'arrow-down'} 
            onClick={() => this.props.toggleExpanded()} />
          <span className="katexable">{this.getSlideTitle()}</span>
          {selectList}
          <Glyphicon
            style={{
              right: '5px',
              display: 'block',
              position: 'absolute',
              top: '30%',
            }}
            glyph="option-vertical"
            onClick={() => this.toggleSelect()} />
        </div>
        {editor}
      </div>
    )
  }
}

Slide.propTypes = {
  // from parent
  data: PropTypes.object.isRequired,
  setSlideType: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  toggleExpanded: PropTypes.func.isRequired,
  makeAnswerSymbolic: PropTypes.func.isRequired,
  
  // bind functions
  createSlide: PropTypes.func.isRequired,
  saveImages: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, bindFunctions)(Slide)
