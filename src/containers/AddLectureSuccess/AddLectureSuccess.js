import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import {Link} from 'react-router';

import {getNewLectureId} from 'redux/modules/lectures';

@connect(state => ({
  lectureId: getNewLectureId(state)
}))
export default class AddLectureSuccess extends Component {
  static propTypes = {
    lectureId: PropTypes.string.isRequired
  };

  render() {
    return (
      <div className="container">
        <h1>Лекция создана!</h1>
        <h3><Link to={`/lecturePreview/${this.props.lectureId}/0`}>предпросмотр</Link></h3>
        Можно <Link to="/addLecture">создать</Link> еще одну,
        посмотреть <Link to="/lecturesList">список лекций</Link> или <Link to="/">вернуться на главную</Link>.
      </div>
    );
  }
}
