/**
 * Created by booolbash on 19.07.16.
 */
import React, {Component, PropTypes} from 'react'
import {findDOMNode} from 'react-dom'
import {connect} from 'react-redux'
import Helmet from 'react-helmet'
import moment from 'moment'
import _gridSize from 'helpers/detectBootstrapResponsiveBreakpoints';
// moment.locale('ru')

import {Link} from 'react-router'
import Button from 'react-bootstrap/lib/Button'
import Table from 'react-bootstrap/lib/Table'
import Col from 'react-bootstrap/lib/Col'

import {asyncConnect} from 'redux-async-connect'
import {load as loadModules, getModules, findModule, unhide as unhideModule} from 'redux/modules/modules'
import {load as loadLectures, getLecturesList, unhide as unhideLecture} from 'redux/modules/lectures';
import {getCurrentUserRole} from 'redux/modules/auth';
import {routeActions} from 'react-router-redux'

import styles from './ThrashCan.scss';

import compileKatex from 'utils/compileKatex'


@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch}}) => {
    return Promise.all([dispatch(loadModules()), dispatch(loadLectures())]);
  }
}])


@connect(
  state => ({
    lectures: getLecturesList(state),
    modules: getModules(state),
    currentUserRole: getCurrentUserRole(state),
    isStudent: state.auth.user.role === 'student'
  }),
  {loadModules, findModule, unhideModule, pushState: routeActions.push, unhideLecture}
)

export default class ThrashCan extends Component {
   static propTypes = {
     lectures: PropTypes.any.isRequired,
     modules: PropTypes.any.isRequired,
     findModule: PropTypes.func.isRequired,
     unhideModule: PropTypes.func.isRequired,
     pushState: PropTypes.func.isRequired,
     currentUserRole: PropTypes.string.isRequired,
     isStudent: PropTypes.bool.isRequired,
     unhideLecture: PropTypes.func.isRequired
   }

  state = {
    gridSize: 'xs'
  };

  componentDidMount() {
    if (__CLIENT__) {
      this.setState({gridSize: _gridSize()});
    }
    compileKatex(findDOMNode(this))
  }

  search(textQuery) {
    this.props.findModule({name: textQuery})
  }

  searchEvent(event) {
    event.preventDefault()
    this.search(this.state.query)
  }

  render() {
    let {lectures, modules: {data}, currentUserRole, isStudent} = this.props;
    let {gridSize} = this.state;
    return (
        <div className="container">
          <Helmet title="Корзина"/>
          <h1>Удаленные лекции</h1>
          {gridSize !== 'xs' && !isStudent && lectures.length !== 0}
          <Col xs={12} sm={12} md={12} lg={12}>
            {
              Array.isArray(lectures) && lectures.filter(lecture => !!lecture.hidden).length > 0 &&
              <Table responsive className={styles.customTable}>
                <thead>
                <tr>
                  <th>Название</th>
                  <th>Автор</th>
                  <th>Дата создания</th>
                  {(currentUserRole === 'admin' || currentUserRole === 'teacher') && <th></th>}
                </tr>
                </thead>
                <tbody>
                {
                  lectures
                    .filter(lecture => !!lecture.hidden)
                    .map(lecture =>
                      <tr key={lecture._id}>
                        <td className="katexable"><Link to={`/lecturePreview/${lecture._id}/0`}>{lecture.name}</Link></td>
                        <td>{lecture.author.username}</td>
                        <td>{moment(new Date(lecture.created)).calendar()}</td>
                        {(currentUserRole === 'admin' || currentUserRole === 'teacher') &&
                        <td><Button onClick={() => this.props.unhideLecture(lecture._id)}>восстановить</Button></td>
                        }
                      </tr>
                    )
                }
                </tbody>
              </Table>
            }
            {
              !(Array.isArray(lectures) && lectures.filter(lecture => !!lecture.hidden).length > 0) &&
              <div>В корзине нет лекций</div>
            }
          </Col>
          <h1>Удаленные модули</h1>
          {gridSize !== 'xs' && !isStudent && data.length !== 0}
          <Col xs={12} sm={12} md={12} lg={12}>
            {
              Array.isArray(data) && data.filter(module => !!module.hidden).length > 0 &&
              <Table responsive>
                <thead>
                <tr>
                  <th>Название</th>
                  <th>Автор</th>
                  <th>Дата создания</th>
                </tr>
                </thead>
                <tbody>
                {
                  data
                    .filter(module => !!module.hidden)
                    .map(module =>
                      <tr key={module._id}>
                        <td className="katexable"><Link to={`/modulePreview/${module._id}`}>{module.name}</Link></td>
                        <td>{module.author.username}</td>
                        <td>{moment(new Date(module.created)).calendar()}</td>
                        {(currentUserRole === 'admin' || currentUserRole === 'teacher') &&
                        <td onClick={() => this.props.unhideModule(module._id)}><Button>восстановить</Button></td>
                        }
                      </tr>
                    )
                }
                </tbody>
              </Table>
            }
            {
              !(Array.isArray(data) && data.filter(module => !!module.hidden).length > 0) &&
              <div>В корзине нет модулей</div>
            }
          </Col>
        </div>
    )
  }

}
