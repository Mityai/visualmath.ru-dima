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
      // do i need it?
      if (!lecture) {
        return Promise.reject('lecture not found');
      }

      let query = {
        lecture: lecture._id,
        speaker: user._id,
        ended: false
      };

      return ActiveLecture.findOne(query).exec();
    })
    .then(activeLecture => {
      if (!activeLecture) {
        return (
          new ActiveLecture({
            lecture: id,
            speaker: user._id
          })
        ).save();
      }

      activeLecture.ended = false;
      activeLecture.ongoingModule = 0;
      return activeLecture.save();
    })
    .then(activeLecture => {
      io.emit(`lecture ${activeLecture._id}`, {type: 'START', activeLecture});
      io.emit(`lecture`, {type: 'START', activeLecture});
      io.emit(`sync_v1/lectures/start`, {
        type: 'LECTURE_START', 
        activeLecture,
      })
      return activeLecture;
    });
});
