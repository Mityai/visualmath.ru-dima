import {access} from '../../utils/access';
import {ActiveQuestion} from '../../models/activeQuestion';

export default access(
  'student',
  ({body: {activeQuestionId, answer}}, res, user) => {
    if (!activeQuestionId) {
      return Promise.reject('activeQuestionId не отправлен');
    }

    if (typeof activeQuestionId !== 'string') {
      return Promise.reject('activeQuestionId должен быть строкой');
    }

    if (!answer) {
      return Promise.reject('answer не отправлен');
    }

    if (!Array.isArray(answer)) {
      return Promise.reject('answer должен быть массивом');
    }

    return ActiveQuestion.findOne({_id: activeQuestionId})
      .exec()
      .then(activeQuestion => {
        if (!activeQuestion) {
          return Promise.reject(`activeQuestion id [${activeQuestionId}] не существует`);
        }

        let userInArray = activeQuestion.userAnswers
          .filter(
            userAnswers => {
              console.log(userAnswers.user);
              return userAnswers.user.toString() === user._id;
            })[0];

        if (!!userInArray) {
          return Promise.reject(`пользователь (id [${userInArray}]) уже ответил на вопрос (id [${activeQuestionId}])`);
        }

        activeQuestion.userAnswers.push({
          user: user._id,
          answer
        });

        return activeQuestion.save();
      });
  }
);
