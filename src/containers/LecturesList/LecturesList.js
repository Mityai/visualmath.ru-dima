import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {findDOMNode} from 'react-dom'
import Helmet from 'react-helmet';
import _gridSize from 'helpers/detectBootstrapResponsiveBreakpoints';
import moment from 'moment';
// moment.locale('ru');

import {Link} from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import Table from 'react-bootstrap/lib/Table';
import Col from 'react-bootstrap/lib/Col';
import Input from 'react-bootstrap/lib/Input';

import {asyncConnect} from 'redux-async-connect';
import {load as loadLectures, getLecturesList, start as startLecture, hide as hideLecture} from 'redux/modules/lectures';
import {getCurrentUserRole} from 'redux/modules/auth';
import {routeActions} from 'react-router-redux';

import styles from './LecturesList.scss';

import compileKatex from 'utils/compileKatex'

@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch}}) => {
    return dispatch(loadLectures());
  }
}])
@connect(
  state => ({
    lectures: getLecturesList(state),
    currentUserRole: getCurrentUserRole(state),
    isStudent: state.auth.user.role === 'student'
  }),
  {pushState: routeActions.push, startLecture, hideLecture}
)
export default class LecturesList extends Component {
  static propTypes = {
    lectures: PropTypes.any.isRequired,
    pushState: PropTypes.func.isRequired,
    currentUserRole: PropTypes.string.isRequired,
    startLecture: PropTypes.func.isRequired,
    isStudent: PropTypes.bool.isRequired,
    hideLecture: PropTypes.func.isRequired
  };

  state = {
    gridSize: 'xs',
    nameFilter: '',
    authorFilter: '',
    dateFilter: ''
  };

  componentDidMount() {
    if (__CLIENT__) {
      this.setState({gridSize: _gridSize()});
    }
    compileKatex(findDOMNode(this))
  }

  startLecture(id) {
    let { startLecture } = this.props;
    startLecture(id)
      .then(({_id}) => {
        if (__DEVELOPMENT__) {
          window.location = `http://localhost:8000/speaker/lecture/${_id}`
        } else {
          window.location = `http://sync.visualmath.ru/speaker/lecture/${_id}`
        }
      });
  }

  subStringPredicate(findString = '', targetString = '') {
    let findStr = findString.toLowerCase();
    let targetStr = targetString.toLowerCase();
    return findStr === null || findStr === '' || targetStr !== null && targetStr.indexOf(findStr) !== -1;
  }

  nameFilterPredicate(targetStr) {
    let findStr = this.state.nameFilter;
    return this.subStringPredicate(findStr, targetStr);
  }

  authorFilterPredicate(targetStr) {
    let findStr = this.state.authorFilter;
    return this.subStringPredicate(findStr, targetStr);
  }

  dateFilterPredicate(targetStr) {
    let findStr = this.state.dateFilter;
    return this.subStringPredicate(findStr, targetStr);
  }

  render() {
    let {lectures, currentUserRole, isStudent} = this.props;
    let {gridSize} = this.state;

    return (
      <div className="container">
        <Helmet title="Список лекций"/>
        <h1>Список лекций</h1>
        {gridSize !== 'xs' && !isStudent && lectures.length !== 0 &&
        <Col xs={12} lg={3} md={3} sm={4}>
          <Button onClick={() => this.props.pushState('/lecture_constructor')}>Добавить лекцию</Button>
        </Col>}
        <Col xs={12} sm={12} md={12} lg={12}>
          {
            Array.isArray(lectures) && lectures.length > 0 &&
            <Table responsive className={styles.customTable}>
              <thead>
              <tr>
                <th>
                  <span>Название</span>
                  <Input type="text" placeholder="Фильтр по названию"
                    value = {this.state.nameFilter} onChange = {({target})=>{this.setState({nameFilter: target.value})}}/> </th>
                <th>
                  <span>Автор</span>
                  <Input type="text" placeholder="Фильтр по автору"
                    value = {this.state.authorFilter} onChange = {({target})=>{this.setState({authorFilter: target.value})}}/></th>
                <th>
                  <span> Дата создания</span>
                  <Input type="text" placeholder="Фильтр по дате"
                    value = {this.state.dateFilter} onChange = {({target})=>{this.setState({dateFilter: target.value})}}/></th>
                {(currentUserRole === 'admin' || currentUserRole === 'teacher') && <th></th>}
                {(currentUserRole === 'admin' || currentUserRole === 'teacher') && <th></th>}
                {(currentUserRole === 'admin' || currentUserRole === 'teacher') && <th></th>}
              </tr>
              </thead>
              <tbody>
              {
                lectures
                  .filter(lecture => !lecture.hidden)
                  .filter(lecture => this.nameFilterPredicate(lecture.name))
                  .filter(lecture => this.authorFilterPredicate(lecture.author.username))
                  .filter(lecture => this.dateFilterPredicate(moment(new Date(lecture.created)).calendar().toString()))
                  .map(lecture =>
                  <tr key={lecture._id}>
                    <td className="katexable"><Link to={`/lecturePreview/${lecture._id}/0`}>{lecture.name}</Link></td>
                    <td>{lecture.author.username}</td>
                    <td>{moment(new Date(lecture.created)).calendar()}</td>
                    {(currentUserRole === 'admin' || currentUserRole === 'teacher') &&
                    <td><Button onClick={() => this.props.hideLecture(lecture._id)}>удалить</Button></td>
                    }
                    {(currentUserRole === 'admin' || currentUserRole === 'teacher') &&
                    <td>
                      <a onClick={() => this.startLecture(lecture._id)} style={{cursor: 'pointer'}}>
                        <span className="glyphicon glyphicon-play" ariaHidden="true"></span> начать
                      </a>
                    </td>
                    }
                    {(currentUserRole === 'admin' || currentUserRole === 'teacher') &&
                    <td>
                      <Link to={`/lectureHistory/${lecture._id}`}>
                        Детали
                      </Link>
                    </td>
                    }
                  </tr>
                )
              }
              </tbody>
            </Table>
          }
          {
            !(Array.isArray(lectures) && lectures.length > 0) &&
            <div>Пока лекций еще нет. Вы можете <Link to="/addLecture">создать первую</Link>.</div>
          }
        </Col>
        {gridSize === 'xs' && !isStudent && lectures.length !== 0 &&
        <Col xs={12} lg={3} md={3} sm={4}>
          <Button onClick={() => this.props.pushState('/lecture_constructor')}>Добавить лекцию</Button>
        </Col>}
      </div>
    );
  }
}
