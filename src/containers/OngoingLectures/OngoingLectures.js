import React, {Component} from 'react';
import Helmet from 'react-helmet';

import Col from 'react-bootstrap/lib/Col';
import {OngoingLectures as OngoingLecturesComponent} from 'components';

import {asyncConnect} from 'redux-async-connect';
import {loadOngoing as loadOngoingLectures} from 'redux/modules/activeLectures';

@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch}}) => {
    return Promise.all([
      dispatch(loadOngoingLectures())/* ,
      dispatch(loadLecturesList())*/
    ]);
  }
}])
export default class OngoingLectures extends Component {
  render() {
    return (
      <div className="container">
        <Helmet title="Активные лекции"/>
        <Col xs={12} sm={8} md={8} lg={8}>
          <OngoingLecturesComponent showNoLecturesMessage/>
        </Col>
      </div>
    );
  }
}
