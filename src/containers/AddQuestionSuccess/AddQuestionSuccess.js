import React, {Component} from 'react';
import {Link} from 'react-router';

export default class AddQuestionSuccess extends Component {
  render() {
    return (
      <div className="container">
        <h1>Вопрос добавлен!</h1>
        <Link to="/addQuestion">Добавить</Link> еще один,
        посмотреть <Link to="/modulesList">список модулей</Link> или <Link to="/">вернуться на главную</Link>
      </div>
    );
  }
}
