import React, {Component, PropTypes} from 'react'

import Helmet from 'react-helmet'
import {Alert, Button, Col, Input} from 'react-bootstrap/lib'

import { connect } from 'react-redux'

import {login} from 'redux/modules/auth'
import {create as createUser} from 'redux/modules/users'


@connect(
  state => ({
    createError: state.users.createError,
    createSuccess: state.users.created,
  }),
  {login, createUser}
)
class RegisterForm extends Component {
  state = {
    login: '',
    password1: '',
    password2: '',
    institution: '',
    group: '',
    loginInvalid: false,
    passwordInvalid: false,
    passwordNotMatch: false,
    institutionInvalid: false,
    groupInvalid: false,
  }

  validateAndLogin() {
    let {login, password1, password2, institution, group} =
      this.state
    if (login.length === 0) {
      this.setState({ loginInvalid: true })
    }
    if (institution.length === 0) {
      this.setState({ institutionInvalid: true })
    }
    if (group.length === 0) {
      this.setState({ groupInvalid: true })
    }

    if (password1.length === 0 || password2.length === 0) {
      this.setState({ passwordInvalid: true })
    } else if (password1 !== password2) {
      this.setState({ passwordNotMatch: true })
    } else if (login.length && institution.length && group.length) {
      this.props.createUser(login, password1, 'student', institution, group)
    }
  }

  render() {
    let {login, password1, password2, institution, group,
      loginInvalid, passwordInvalid, passwordNotMatch,
      institutionInvalid, groupInvalid} = this.state
    let {createError, createSuccess} = this.props

    return (
      <div className="container">
        <Helmet title="Регистрация" />

        <Col lg={3} xs={9} md={5} sm={7}>
          <Input type="text"
            ref={ref => this.loginInput = ref}
            placeholder="Введите логин"
            label="Логин"
            value={login}
            onChange={(event) => this.setState({ login: event.target.value })}
            />

          {
            loginInvalid && !login.length &&
            <Alert bsStyle="danger">
              Введите логин
              </Alert>
          }

          <Input type="password"
            ref={ref => this.password1Input = ref}
            placeholder="Введите пароль"
            label="Пароль"
            value={password1}
            onChange={(event) => this.setState({ password1: event.target.value })}
            />

          <Input type="password"
            ref={ref => this.password2Input = ref}
            placeholder="Повторите пароль"
            label="Пароль"
            value={password2}
            onChange={(event) => this.setState({ password2: event.target.value })}
            />

          {passwordInvalid && (!password1.length || !password2.length) && <Alert bsStyle="danger"> Введите пароль </Alert>}
          {passwordNotMatch && password1 !== password2 && <Alert bsStyle="danger"> Пароли не совпадают </Alert>}

          <Input type="text"
            ref={ref => this.institutionInput = ref}
            placeholder="Введите имя учебного заведения"
            label="Уч. заведение"
            value={institution}
            onChange={(event) => this.setState(
              { institution: event.target.value })}
          />

          {
            institutionInvalid && !institution.length &&
            <Alert bsStyle="danger">
              Введите имя учебного заведения
              </Alert>
          }

          <Input type="text"
            ref={ref => this.groupInput = ref}
            placeholder="Введите класс/группу"
            label="Класс/Группа"
            value={group}
            onChange={(event) => this.setState(
              { group: event.target.value })}
          />

          {
            groupInvalid && !group.length &&
            <Alert bsStyle="danger">
              Введите номер класса/группы
            </Alert>
          }
          {
            (createSuccess !== true && createError) &&
            <div className="alert alert-danger" role="alert">
              <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true" />
              {' '}
              {createError}
            </div>
          }
          {createSuccess && this.props.login(login, password1)}
          <Button type="submit" onClick={() => this.validateAndLogin()}>
            Зарегистрироваться
          </Button>
        </Col>
      </div>
    )
  }
}

RegisterForm.propTypes = {
  createError: PropTypes.string,
  createSuccess: PropTypes.bool,
  createUser: PropTypes.func,
  login: PropTypes.func,
}

export default RegisterForm
