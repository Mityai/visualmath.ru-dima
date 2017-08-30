/* eslint-disable */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import * as authActions from '../../redux/modules/auth';
import {vkAuth, API_ID} from '../../../libs/vkAuth';

@connect(
  state => ({
    user: state.auth.user,
    loginError: state.auth.loginError
  }),
  authActions)
export default class Login extends Component {
  static propTypes = {
    user: PropTypes.object,
    login: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    loginError: PropTypes.string
  };

  componentDidMount() {
    vkAuth();
    window.VK.init({apiId: API_ID});
    window.VK.Widgets.Auth("vk_auth", {
      width: "200px",
      onAuth: this.props.loginVK
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const username = this.refs.username;
    const password = this.refs.password;
    this.props.login(username.value, password.value);
    username.value = '';
    password.value = '';
  };

  render() {
    const {user, logout, loginError} = this.props;
    const styles = require('./Login.scss');
    return (
      <div className={styles.loginPage + ' container'}>
        <Helmet title="Login"/>
        <h1>Login</h1>
        {!user &&
        <div>
          <form className="login-form form-inline" onSubmit={this.handleSubmit}>
            <div className="form-group">
              <input type="text" ref="username" placeholder="Enter a username" className="form-control"/>
              <input type="password" ref="password" placeholder="Enter password" className="form-control"/>
            </div>
            <button className="btn btn-success" onClick={this.handleSubmit}><i className="fa fa-sign-in"/>{' '}Log In
            </button>
            {<div id="vk_auth"  style ={{margin:'10px'}}>

            </div>}
          </form>
        </div>
        }
        {
          loginError &&
            <div className="alert alert-danger" role="alert">
              <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"/>
              {' '}
              {loginError}
            </div>
        }
        {user &&
        <div>
          <p>You are currently logged in as {user.name}.</p>

          <div>
            <button className="btn btn-danger" onClick={logout}><i className="fa fa-sign-out"/>{' '}Log Out</button>
          </div>
        </div>
        }
      </div>
    );
  }
}
