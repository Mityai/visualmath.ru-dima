import {access} from '../../utils/access';
import {Question} from '../../models/question';

export default access(
  'student',
  () => Question.find({}).exec()
);
