import {Question} from '../../models/question';
import {access} from '../../utils/access';

export default access(
  'student',
  ({body: {id}}) => {
    if (!id) {
      return Promise.reject('id не отправлен');
    }
    
    return Question.findOne({_id: id}).exec();
  }
);
