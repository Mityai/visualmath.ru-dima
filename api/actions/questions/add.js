import {Question} from '../../models/question';
import {access} from '../../utils/access';

export default access(
  'teacher',
  ({body: {question, answers, correctAnswers, multiple, isAnswerSymbolic}}) => {
    if (!question) {
      return Promise.reject('не отправлен вопрос');
    }

    if (!answers) {
      return Promise.reject('не отправлены ответы');
    }

    if (!Array.isArray(answers)) {
      return Promise.reject(`'answers' должен быть массивом`);
    }

    if (answers.length === 0) {
      return Promise.reject('должен быть как минимум 1 ответ');
    }

    if (!correctAnswers) {
      return Promise.reject('не отправлены корректные ответы');
    }

    if (!Array.isArray(correctAnswers)) {
      return Promise.reject(`'correctAnswers' должен быть массивом`);
    }

    if (multiple === null || multiple === undefined) {
      return Promise.reject(`multiple : boolean не отправлен`);
    }

    if (typeof multiple !== 'boolean') {
      return Promise.reject(`'multiple' должен быть типа boolean`);
    }

    let ques = new Question({
      question,
      multiple,
      answers,
      correctAnswers,
      isAnswerSymbolic
    });

    return ques.save();
  }
)
