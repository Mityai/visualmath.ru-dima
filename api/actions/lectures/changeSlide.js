import {access} from '../../utils/access';
import {ActiveLecture} from '../../models/activeLecture';
import {io} from '../../api';

export default access('teacher', ({body: {moduleNumber, id}}, res, user) => {
  console.log('lectures/changeSlide')
  console.log('moduleNumber', moduleNumber)
  console.log('lectureId', id)

  if (moduleNumber === null || moduleNumber === undefined) {
    return Promise.reject('moduleNumber не отправлен');
  }

  if (!id) {
    return Promise.reject('id лекции не отправлен');
  }

  return ActiveLecture
    .findOne({speaker: user._id, lecture: id, ended: false})
    .populate('speaker', '-hashedPassword')
    .exec()
    .then(activeLecture => {
      console.log(activeLecture)
      activeLecture.ongoingModule = moduleNumber;
      return activeLecture.save();
    })
    .then(activeLecture => {
      console.log(`lecture ${activeLecture._id}`)
      io.emit(`lecture ${activeLecture._id}`, {
        type: 'SLIDE_CHANGE',
        activeLecture
      });
      return activeLecture;
    });
});
