import {ActiveLecture} from '../../models/activeLecture';
import {access} from '../../utils/access';

export default access(
  'student',
  () => {
    console.log('lectures/listOngoing')

    return new Promise((resolve, reject) => {
      ActiveLecture.find({ended: false})
        .populate('speaker', '-hashedPassword')
        .populate('lecture')
        .exec((err, activeLectures) => {
          if (err) {
            console.error(err);
            reject(`Error lectures/listOngoing`);
          }
          
          resolve(activeLectures);
        });
    });
  }
);
