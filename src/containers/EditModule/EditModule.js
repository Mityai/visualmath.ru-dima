import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {editModule} from 'redux/modules/modules';
import Input from 'react-bootstrap/lib/Input';
import Alert from 'react-bootstrap/lib/Alert';
import { routeActions } from 'react-router-redux';

@connect(
  (state, props) => props,
  {editModule, pushState: routeActions.push}
)
export default class EditModule extends Component {
  static propTypes = {
    editModule: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired
  };

  state = {
    moduleName: '',
    moduleText: '',
    imageUploaded: false
  };

  send() {
    let {moduleName, moduleText, imageUploaded} = this.state;
    let {addModule, pushState} = this.props;
    if (moduleName.length > 0) {
      addModule(moduleName, moduleText).then(() => pushState('/modulePreview'));
    } else {
      this.setState({ validationEnabled: true });
    }
  }

  validateModuleName() {
    if (!this.state.validationEnabled) {
      return null;
    }
    let length = this.state.moduleName.length;
    if (length === 0) return 'danger';
  }

  render() {
    let {validationEnabled} = this.state;

    return (
      <div className="container">
        <Helmet title="Редактировать модуль"/>
        <h1>Добавить модуль</h1>
        <Input type="textarea"
               style={{resize: 'none'}}
               placeholder="Module Name"
               label="Module Name"
               onChange={({target}) => this.setState({ moduleName: target.value })}
        />
        {
          validationEnabled && this.state.moduleName.length === 0 &&
          <Alert bsStyle={this.validateModuleName()}>
            Введите имя
          </Alert>
        }
        <Input type="textarea"
               label="Module Text"
               placeholder="Module Text"
               onChange={({target}) => this.setState({ moduleText: target.value })}
        />
        <button type="button" className="btn btn-primary" onClick={::this.send}>Send!</button>
      </div>
    );
  }
}
