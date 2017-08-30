import {access} from '../../utils/access';
import {ActiveQuestion} from '../../models/activeQuestion';

export default access(
  'student',
  ({body: {id, question, activeLecture}}) =>
    ActiveQuestion.findOne({
      question,
      activeLecture
    }).exec()
);
