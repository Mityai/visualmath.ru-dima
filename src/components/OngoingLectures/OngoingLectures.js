import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import Table from 'react-bootstrap/lib/Table';
import Input from 'react-bootstrap/lib/Input';

import {
  getOngoingLecturesList,
  localAdd as localAddActiveLecture,
  localFinish as localFinishLecture
} from 'redux/modules/activeLectures';
import {getUsersListAsIs, loadSingle as loadUser} from 'redux/modules/users';
import {getLecturesListAsIs, finish as stopLecture, loadSingle as loadLecture} from 'redux/modules/lectures';

@connect(state => {
  let users = getUsersListAsIs(state);
  let lectures = getLecturesListAsIs(state);
  return {
    lectures: getOngoingLecturesList(state)
      .filter(({ended}) => !ended)
      .map(ongoing => {
        let lectureId = typeof ongoing.lecture === 'object' ? ongoing.lecture._id : ongoing.lecture
        let speaker = typeof ongoing.speaker === 'object' ? ongoing.speaker : users[ongoing.speaker]
        return Object.assign({}, ongoing, {
          lecture: lectures[lectureId],
          speaker
        });
      }),
    user: state.auth.user
  };
}, {stopLecture, localAddActiveLecture, loadLecture, loadUser, localFinishLecture})
export default class OngoingLectures extends Component {
  static propTypes = {
    lectures: PropTypes.array.isRequired,
    showNoLecturesMessage: PropTypes.bool,
    stopLecture: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    localAddActiveLecture: PropTypes.func.isRequired,
    loadLecture: PropTypes.func.isRequired,
    loadUser: PropTypes.func.isRequired,
    localFinishLecture: PropTypes.func.isRequired
  };

  state = {
    nameFilter: '',
    authorFilter: ''
  };

  componentDidMount() {
    if (socket) {
      let {localAddActiveLecture, loadLecture, loadUser, localFinishLecture} = this.props;
      socket.on('lecture', data => {
        if (data.type === 'START') {
          let promises = [loadLecture(data.activeLecture.lecture), loadUser(data.activeLecture.speaker)];
          Promise.all(promises).then(() => localAddActiveLecture(data.activeLecture));
        } else if (data.type === 'FINISH') {
          localFinishLecture(data.activeLecture._id);
        }
      });
    }
  }

  componentWillUnmount() {
    // remove socket
  }

  stopLecture(lectureId) {
    let {stopLecture} = this.props;
    stopLecture(lectureId);
  }

  subStringPredicate(findString, targetString) {
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

  render() {
    let {lectures, showNoLecturesMessage, user} = this.props;

    let styles = require('./OngoingLectures.scss');

    if (lectures.length === 0 && showNoLecturesMessage) {
      return (
        <div className={styles.ongoingLectures}>
          <div className={styles.header}><h1>Лекции прямо сейчас</h1></div>
          <div>
            Сейчас нет активных лекций
          </div>
        </div>
      );
    } else if (lectures.length === 0) {
      return null;
    }

    return (
      <div className={styles.ongoingLectures}>
        <div className={styles.header}><h1>Лекции прямо сейчас</h1></div>
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
            {
              user.role === 'admin' && // todo: сдедать это же для роли teacher
              <th/>
            }
          </tr>
          </thead>
          <tbody>
          {
            lectures
            .filter(lec => this.nameFilterPredicate(lec.lecture.name))
            .filter(lec => this.authorFilterPredicate(lec.speaker.username))
            .map(({lecture, speaker, _id}) =>
              <tr key={_id}>
                <td><a href={
                  (__DEVELOPMENT__ ? 'http://localhost:8000' : 'http://sync.visualmath.ru') + (user.role !== 'student' ? '/speaker' : '') + `/lecture/${_id}`
                }>{lecture.name}</a></td>
                <td>{speaker.username}</td>
                {
                  user.role === 'admin' &&
                  <td>
                    <a onClick={() => this.stopLecture(lecture._id)} style={{cursor: 'pointer'}}>
                      <span className="glyphicon glyphicon-stop" ariaHidden="true"></span> завершить
                    </a>
                  </td>
                }
              </tr>
            )
          }
          </tbody>
        </Table>
      </div>
    );
  }
}
