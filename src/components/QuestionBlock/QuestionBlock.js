import React, { PropTypes, Component } from 'react'
import { Speaker as SpeakerQuestionBlock } from './Speaker'
import { Student as StudentQuestionBlock } from './Student'


export default class QuestionsBlock extends Component {
  static propTypes = {
    // from parent
    questionBlock: PropTypes.object.isRequired,
    activeLectureId: PropTypes.string.isRequired,
    isStudent: PropTypes.bool.isRequired,
  }


  render() {
    let { isStudent, ...restProps } = this.props

    if (isStudent) {
      return <StudentQuestionBlock {...restProps}/>
    }

    return <SpeakerQuestionBlock {...restProps}/>
  }
}
