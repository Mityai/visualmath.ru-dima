import {Lecture} from '../../models/lecture';
import {access} from '../../utils/access';

export default access(
  'student',
  () => {
    return new Promise((resolve, reject) => {
      Lecture.find({})
        .populate('author', '-hashedPassword')
        .populate('modules') // todo: убрать это в целях оптимизации трафика.
        .populate('questions')
        .populate('mapping')
        // Сделать, чтобы при загрузке превью лекции делалась дозагрузка модулей по id лекции
        .exec((err, lectures) => {
          if (err) {
            console.error(err);
            reject(`Error lectures/list`);
          }

          resolve(lectures);
        });
    });
  }
);
