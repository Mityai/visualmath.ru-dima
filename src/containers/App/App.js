import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Helmet from 'react-helmet';
import { isLoaded as isAuthLoaded, load as loadAuth, logout } from 'redux/modules/auth';
import { routeActions } from 'react-router-redux';
import config from '../../config';
import { asyncConnect } from 'redux-async-connect';


@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const promises = [];

    if (!isAuthLoaded(getState())) {
      promises.push(dispatch(loadAuth()));
    }

    return Promise.all(promises);
  }
}])
@connect(
  state => ({user: state.auth.user}),
  {logout, pushState: routeActions.push})
export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    user: PropTypes.object,
    logout: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.user && nextProps.user) {
      // login
      this.props.pushState('/loginSuccess');
    } else if (this.props.user && !nextProps.user) {
      // logout
      this.props.pushState('/');
    }
  }

  handleLogout = (event) => {
    event.preventDefault();
    this.props.logout();
  };

  render() {
    const {user} = this.props;
    const styles = require('./App.scss');

    return (
      <div className={styles.app}>
        <Helmet {...config.app.head}/>
        <Navbar fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <IndexLink to="/" activeStyle={{color: '#33e0ff'}}>
                <span>{config.app.title}</span>
              </IndexLink>
            </Navbar.Brand>
            <Navbar.Toggle/>
          </Navbar.Header>

          <Navbar.Collapse eventKey={0}>
            <Nav navbar>
              {!user &&
                <LinkContainer to="/login">
                  <NavItem eventKey={5}>Войти</NavItem>
                </LinkContainer>}
              {!user &&
                <LinkContainer to="/register">
                  <NavItem eventKey={5}>Зарегистрироваться</NavItem>
                </LinkContainer>}
              {user && user.role !== 'student' &&
                <LinkContainer to="/modulesList">
                  <NavItem eventKey={8} className="modules-list-link">
                    Модули
                  </NavItem>
                </LinkContainer>}

              {user && user.role !== 'student' &&
                <LinkContainer to="/visualModulesList">
                  <NavItem eventKey={8} className="modules-list-link">
                    Визуальные модули
                  </NavItem>
                </LinkContainer>}

              {user && user.role !== 'student' &&
                <LinkContainer to="/questionsList">
                  <NavItem eventKey={8} className="modules-list-link">
                    Вопросы
                  </NavItem>
                </LinkContainer>}
              {
                user && user.role !== 'student' &&
                  <LinkContainer to="/blocksList">
                    <NavItem className="modules-list-link">
                      Блоки вопросов
                    </NavItem>
                  </LinkContainer>
              }
              {user && user.role !== 'student' &&
                <LinkContainer to="/lecturesList">
                  <NavItem eventKey={8} className="modules-list-link">
                    Лекции
                  </NavItem>
                </LinkContainer>}
              {user && user.role !== 'student' &&
                <LinkContainer to="/thrashCan">
                  <NavItem eventKey={8} className="modules-list-link">
                    Корзина
                  </NavItem>
                </LinkContainer>}
              {user &&
                <LinkContainer to="/ongoingLectures">
                  <NavItem eventKey={8} className="modules-list-link">
                    Активные лекции
                  </NavItem>
                </LinkContainer>}
              {/* user && user.role === 'admin' &&
                <LinkContainer to="/usersList">
                  <NavItem eventKey={8} className="modules-list-link">
                    Users
                  </NavItem>
                </LinkContainer> */}
              {/* user &&
              <NavItem>Логин: {user.username}</NavItem> */}
              {user &&
              <LinkContainer to="/logout">
                <NavItem eventKey={6} className="logout-link" onClick={this.handleLogout}>
                  Выйти
                </NavItem>
              </LinkContainer>}
              {user &&
              <LinkContainer to="/PersonLK">
                <NavItem eventKey={8} className="modules-list-link">
                  {user.name || user.username}
                </NavItem>
              </LinkContainer>}
            </Nav>
            {/* <p className={styles.loggedInMessage + ' navbar-text'}><strong>{user.name}</strong></p> */}
          </Navbar.Collapse>
        </Navbar>

        <div className={styles.appContent}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
