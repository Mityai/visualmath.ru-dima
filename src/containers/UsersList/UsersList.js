import React, { Component, PropTypes } from 'react'

import { connect } from 'react-redux'
import { asyncConnect } from 'redux-async-connect'

import Helmet from 'react-helmet'
import { Alert, Button, Col, Input, Table } from 'react-bootstrap/lib'

import { create as createUser } from 'redux/modules/users';
import { getAllUsersListAsIs as getUsers, loadAll as loadUsers } from 'redux/modules/users'

// import moment from 'moment'


@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch}}) => {
    return dispatch(loadUsers())
  }
}])
@connect(
  state => ({
    createError: state.users.createError,
    createSuccess: state.users.created,
    users: getUsers(state),
  }),
  { createUser, getUsers }
)

export default class UsersList extends Component {
  static propTypes = {
    users: PropTypes.array.isRequired,
    createUser: PropTypes.func,
    createError: PropTypes.string,
    createSuccess: PropTypes.bool
  }

  state = {
    usernameFilter: '',
    institutionFilter: '',
    groupFilter: '',
    login: '',
    password1: '',
    password2: '',
    institution: '',
    group: '',
    access: 'student',
    loginInvalid: false,
    passwordInvalid: false,
    passwordNotMatch: false,
    institutionInvalid: false,
    groupInvalid: false,
  };

  subStringPredicate(findString, targetString) {
    let findStr = findString.toLowerCase();
    let targetStr = targetString.toLowerCase();
    return findStr === null || findStr === '' || targetStr !== null &&
      targetStr.indexOf(findStr) !== -1;
  }

  usernameFilterPredicate(targetStr) {
    let findStr = this.state.usernameFilter;
    return this.subStringPredicate(findStr, targetStr);
  }

  institutionFilterPredicate(targetStr) {
    let findStr = this.state.institutionFilter;
    return this.subStringPredicate(findStr, targetStr || '');
  }

  groupFilterPredicate(targetStr) {
    let findStr = this.state.groupFilter;
    return this.subStringPredicate(findStr, targetStr || '');
  }

  validateAndSend() {
    let {login, password1, password2, access, institution, group} = this.state
    if (login.length === 0) {
      this.setState({ loginInvalid: true })
    }
    if (institution.length === 0 && access === 'student') {
      this.setState({ institutionInvalid: true })
    }
    if (group.length === 0 && access === 'student') {
      this.setState({ groupInvalid: true })
    }

    if (password1.length === 0 || password2.length === 0) {
      this.setState({ passwordInvalid: true })
    } else if (password1 !== password2) {
      this.setState({ passwordNotMatch: true })
    } else if (login.length && (institution.length && group.length ||
      access !== 'student')) {
      this.props.createUser(login, password1, access, institution, group)
    }
  }

  render() {
    const {users, createError, createSuccess} = this.props
    let {loginInvalid, passwordInvalid,
      passwordNotMatch, login, password1, password2,
      institution, group, institutionInvalid, groupInvalid} = this.state

    return (
      <div className="container">
        <Helmet title="Список пользователей" />
        <h1>Список пользователей</h1>

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

          <Input type="select"
            label="Права доступа"
            onChange={(event) => this.setState({ access: event.target.value })}>
            <option value="student">Студент</option>
            <option value="teacher">Учитель</option>
            <option value="admin">Администратор</option>
          </Input>

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
          {
            login && createSuccess &&
            <div className="alert alert-success" role="alert">
              <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true" />
              {' '}
              {`Пользователь ${login} успешно создан`}
            </div>
          }
          <Button type="submit" onClick={() => this.validateAndSend()}>
            Добавить пользователя
          </Button>
        </Col>
        <Col xs={12} sm={12} md={12} lg={12}>
          {
            Array.isArray(users) && users.length > 0 &&
            <Table responsive>
              <thead>
                <tr>
                  <th>
                    <span>Логин</span>
                    <Input type="text" placeholder="Фильтр по логину"
                      value={this.state.usernameFilter} onChange={({target}) => { this.setState({ usernameFilter: target.value }) } } />
                  </th>
                  <th>
                    <span> Уч. заведение </span>
                    <Input type="text" placeholder="Фильтр по уч.заведению"
                      value={this.state.institutionFilter}
                      onChange={({target}) => { this.setState({ institutionFilter: target.value }) } } />
                  </th>
                  <th>
                    <span> Класс/группа </span>
                    <Input type="text" placeholder="Фильтр по классу/группе"
                      value={this.state.groupFilter} onChange={({target}) => { this.setState({ groupFilter: target.value }) } } />
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  users
                    .filter(user =>
                      this.usernameFilterPredicate(user.name || user.username))
                    .filter(user =>
                    this.institutionFilterPredicate(user.university))
                    .filter(user =>
                      this.groupFilterPredicate(user.group))
                    .map(user =>
                      <tr key={user._id}>
                        <td> {user.name || user.username} </td>
                        <td> {user.university || ''} </td>
                        <td> {user.group || ''} </td>
                      </tr>
                    )
                }
              </tbody>
            </Table>
          }
          {
            !(Array.isArray(users) && users.length > 0) &&
            <div>Пока нет ни одного пользователя.</div>
          }
        </Col>
      </div>
    )
  }
}
