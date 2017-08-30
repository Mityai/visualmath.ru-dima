import { Component } from 'react'
import { findDOMNode } from 'react-dom'
import compileKatex from './compileKatex'

export class KatexableComponent extends Component {
  componentDidMount() {
    try {
      compileKatex(findDOMNode(this))
    } catch (err) {
      console.warn('Ошибка katex')
    }
  }

  componentDidUpdate() {
    try {
      compileKatex(findDOMNode(this))
    } catch (err) {
      console.warn('Ошибка katex')
    }
  }
}
