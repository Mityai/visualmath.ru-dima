/**
 * Created by booolbash on 16.11.16.
 */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import {saveUser} from 'redux/modules/users'
import * as authActions from 'redux/modules/auth';

import Button from 'react-bootstrap/lib/Button';
import Input from 'react-bootstrap/lib/Input';

@connect(
  state => ({user: state.auth.user}),
  {authActions, saveUser})

export default
class PersonLK extends Component {
  static propTypes = {
    user: PropTypes.object,
    saveUser: PropTypes.func,
  };


  state = {
    user: this.props.user,
    password: null
  }


  update(prop, value) {
    this.setState({user: {...this.state.user, [prop]: value}});
  }

  handleSubmit() {
    this.props.saveUser(this.state.user, this.state.password)
  }

  render() {
    const {user} = this.state;
    return (user &&
      <div className="container">
        <h1>Личный кабинет</h1>
        <form className="form-inline" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <p>
              <span>Имя: </span>
              <Input type="text" ref="firstname" placeholder="Enter a firstname" defaultValue={user.first_name} onChange = {({target})=>this.update('first_name', target.value)} />
            </p>
            <p>
              <span>Фамилия: </span>
              <Input type="text" ref="lastname" placeholder="Enter a lastname" defaultValue={user.last_name} onChange = {({target})=>this.update('last_name', target.value)} />
            </p>
            <p>
              <span>Университет: </span>
              <Input type="text" ref="university" placeholder="Enter an university" defaultValue={user.university} onChange = {({target})=>this.update('university', target.value)} />
            </p>
            <p>
              <span>Группа: </span>
              <Input type="text" ref="group" placeholder="Enter a group" defaultValue={user.group} onChange = {({target})=>this.update('group', target.value)} />
            </p>
            {/* <p><span>Изменить пароль: </span><Input type="text" ref="firstname" placeholder="Enter a firstname"/></p> */}
          </div>
          <div>
            <Button className="btn btn-success" onClick={() => this.handleSubmit()}><i className="fa fa-sign-in"/>{' '}Применить
            </Button>
          </div>
        </form>
      </div>);
  }
}
