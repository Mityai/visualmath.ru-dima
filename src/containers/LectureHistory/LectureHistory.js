import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { asyncConnect } from 'redux-async-connect'
import Helmet from 'react-helmet'
import moment from 'moment'

import { getLectureById, loadSingle as loadLectureById } from 'redux/modules/lectures'
import { loadListByLectureId as loadActiveLectures, listByLectureId } from 'redux/modules/activeLectures'

@asyncConnect([{
  deferred: true,
  promise: ({ store: { dispatch }, params: { lectureId } }) => {
    return Promise.all([
      dispatch(loadLectureById(lectureId)),
      dispatch(loadActiveLectures(lectureId))
    ])
  }
}])
@connect((state, { params: { lectureId } }) => {
  return {
    lecture: getLectureById(state, lectureId) || {},
    activeLectures: listByLectureId(state, lectureId)
  }
})
export default class LectureHistory extends Component {
  static propTypes = {
    lecture: PropTypes.object.isRequired,
    activeLectures: PropTypes.array.isRequired
  }

  render() {
    let { lecture, activeLectures } = this.props
    let name = lecture.name ? (' - ' + lecture.name) : ''

    return (
      <div className="container">
        <Helmet title={'История' + name}/>
        <h1 style={{fontSize: '1.2em'}}>История лекции "{lecture.name}"</h1>
        {
          activeLectures.map(it => {
            let date = it.created ? moment(new Date(it.created)).calendar() : it._id
            return (
              <div key={it._id}>
                <Link to={`/activeLectureDetails/${it._id}`}>{date}</Link>
              </div>
            )
          })
        }
      </div>
    )
  }
}
