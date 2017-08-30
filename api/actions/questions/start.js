import {ActiveQuestion} from '../../models/activeQuestion';
import {Question} from '../../models/question';
import {ActiveLecture} from '../../models/activeLecture';
import {io} from '../../api';
import {access} from '../../utils/access';

export default access(
  'teacher',
  ({body: {activeLectureId, questionId}}, res, user) => {
    if (!activeLectureId) {
      return Promise.reject('activeLectureId не отправлен');
    }

    if (typeof activeLectureId !== 'string') {
      return Promise.reject(`'activeLectureId' должен быть строкой`);
    }

    if (!questionId) {
      return Promise.reject('questionId не отправлен');
    }

    if (typeof questionId !== 'string') {
      return Promise.reject(`'questionId' должен быть строкой`);
    }

    return ActiveLecture.count({_id: activeLectureId})
      .exec()
      .then(count => {
        if (count !== 1) {
          return Promise.reject(`activeLecture id [${activeLectureId}] не существует`);
        }

        return Question.count({_id: questionId}).exec();
      })
      .then(count => {
        if (count !== 1) {
          return Promise.reject(`вопрос id [${questionId}] не существует`);
        }

        let activeQuestionQuery = {
          activeLecture: activeLectureId,
          question: questionId
        };

        return ActiveQuestion.findOne(activeQuestionQuery).exec();
      })
      .then(activeQuestion => {
        if (!activeQuestion) {
          return (
            new ActiveQuestion({
              creator: user._id,
              activeLecture: activeLectureId,
              question: questionId
            })
          ).save();
        }

        activeQuestion.ended = false;
        activeQuestion.userAnswers = [];
        return activeQuestion.save();
      })
      .then(activeQuestion => {
        io.emit(`activeLecture ${activeLectureId}`, {
          type: 'QUESTION_START',
          activeQuestion
        });
        return activeQuestion;
      });
  }
);
