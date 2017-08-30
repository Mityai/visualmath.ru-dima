import {access} from '../../utils/access';
import {ActiveQuestion} from '../../models/activeQuestion';
import {ActiveLecture} from '../../models/activeLecture';
import {io} from '../../api';

export default access(
  'teacher',
  ({body: {activeQuestionId, activeLectureId}}, res, user) => {
    if (!activeQuestionId) {
      return Promise.reject(`activeQuestionId не отправлен`);
    }

    if (typeof activeQuestionId !== 'string') {
      return Promise.reject(`activeQuestionId должен быть строкой`);
    }

    if (!activeLectureId) {
      return Promise.reject(`activeLectureId не отправлен`);
    }

    if (typeof activeLectureId !== 'string') {
      return Promise.reject(`activeLectureId должен быть строкой`);
    }

    return ActiveLecture.count({_id: activeLectureId}).exec()
      .then(count => {
        if (count === 0) {
          return Promise.reject(`лекция (id [${activeLectureId}]) не существует`);
        }

        return ActiveQuestion.findOne({_id: activeQuestionId}).exec();
      })
      .then(activeQuestion => {
        if (!activeQuestion) {
          return Promise.reject(`activeQuestion id [${activeQuestionId}] не существует`);
        }

        activeQuestion.ended = true;
        return activeQuestion.save();
      })
      .then(activeQuestion => {
        io.emit(`lecture ${activeLectureId}`, {
          type: 'QUESTION_FINISH',
          activeQuestion
        });

        return activeQuestion;
      });
  }
)
