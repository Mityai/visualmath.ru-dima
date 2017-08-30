import {access} from '../../utils/access';
import {Lecture} from '../../models/lecture';
import {ActiveLecture} from '../../models/activeLecture';
import {io} from '../../api';

export default access('teacher', ({body: {id}}, res, user) => {
  if (!id) {
    return Promise.reject('id лекции не отправлен');
  }

  return Lecture.findOne({_id: id})
    .exec()
    .then(lecture => {
      if (!lecture) {
        return Promise.reject(`лекция (id ${id}) не найдена`);
      }
      return ActiveLecture.findOne({
        lecture: lecture._id,
        speaker: user._id,
        ended: false
      }).exec()
    })
    .then(activeLecture => {
      if (!activeLecture) {
        return Promise.reject(`activeLecture (lecture id: ${id}, id лектора: ${user._id}) не найдена`);
      }

      activeLecture.ended = true;
      return activeLecture.save();
    })
    .then(activeLecture => {
      io.emit(`lecture ${activeLecture._id}`, { type: 'FINISH', activeLecture });
      io.emit(`lecture`, { type: 'FINISH', activeLecture });
      return activeLecture;
    });
});
