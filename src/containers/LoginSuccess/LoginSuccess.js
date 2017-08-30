import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {asyncConnect} from 'redux-async-connect';

import * as authActions from 'redux/modules/auth';
import {OngoingLectures} from 'components';
import Col from 'react-bootstrap/lib/Col';

import {loadOngoing as loadOngoingLectures} from 'redux/modules/activeLectures';

@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch}}) => {
    return dispatch(loadOngoingLectures());
  }
}])
@connect(
    state => ({user: state.auth.user}),
    authActions)
export default
class LoginSuccess extends Component {
  static propTypes = {
    user: PropTypes.object
  };

  render() {
    const {user} = this.props;
    return (user &&
      <div className="container">
        <h1>Логин успешен</h1>
        <Col xs={12} smOffset={2} sm={8} mdOffset={2} md={8} lgOffset={2} lg={8}>
          <OngoingLectures />
        </Col>
      </div>
    );
  }
}
