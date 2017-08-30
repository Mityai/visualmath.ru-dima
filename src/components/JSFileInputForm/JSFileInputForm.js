import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';

export default class JSFileInputForm extends Component {
  static propTypes = {
    contentRead: PropTypes.func.isRequired
  };

  readContent() {
    let cb = resolve => {
      let file = findDOMNode(this).querySelector('input')

      if (file.files.length) {
        let reader = new FileReader()

        reader.onload = function onLoad(event) {
          resolve(event.target.result)
        }

        reader.readAsText(file.files[0])
      }
    };

    return new Promise(cb)
      .then(content => this.props.contentRead(content))
  }

  render() {
    return (
      <form name="form_input" encType="multipart/form-data">
        <span style={{fontWeight: 'bold'}}> Визуальный модуль (.js файл) </span>
        <label className="btn btn-primary btn-sm"> Выбрать файл
          <input
            type="file"
            style={{display: 'none'}}
            onChange={() => this.readContent()}/>
        </label>
        <br/>
      </form>
    );
  }
}
