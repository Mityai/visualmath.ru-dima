import {Lecture} from '../../models/lecture';
import {access} from '../../utils/access';

export default access(
  'student',
  ({body: {id}}) => {
    if (!id) {
      return Promise.reject('id лекции не отправлен');
    }
    return Lecture.findOne({_id: id})
      .populate('author', '-hashedPassword')
      .populate('modules')
      .populate('questions')
      .populate('mapping')
      .exec()
  }
);
