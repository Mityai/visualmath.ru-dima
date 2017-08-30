import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom'
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import moment from 'moment';
// moment.locale('ru');

import {Link} from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import Table from 'react-bootstrap/lib/Table';
import Input from 'react-bootstrap/lib/Input';
import Col from 'react-bootstrap/lib/Col';

import {asyncConnect} from 'redux-async-connect';
import {list} from 'redux/modules/questions';
import {routeActions} from 'react-router-redux';

import compileKatex from 'utils/compileKatex'

@asyncConnect([{
  promise: ({store: {dispatch}}) => {
    return dispatch(list());
  }
}])
@connect(
  state => ({
    questions: Object.values(state.questions.list),
    isStudent: state.auth.user.role === 'student'
  }),
  {pushState: routeActions.push}
)
export default class QuestionsList extends Component {
  static propTypes = {
    questions: PropTypes.any.isRequired,
    pushState: PropTypes.func.isRequired,
    isStudent: PropTypes.bool.isRequired
  };

  state = {
    nameFilter: '',
    dateFilter: ''
  };

  componentDidMount() {
    compileKatex(findDOMNode(this))
  }

  subStringPredicate(findString, targetString) {
    let findStr = findString.toLowerCase();
    let targetStr = targetString.toLowerCase();
    return findStr === null || findStr === '' || targetStr !== null && targetStr.indexOf(findStr) !== -1;
  }

  nameFilterPredicate(targetStr) {
    let findStr = this.state.nameFilter;
    return this.subStringPredicate(findStr, targetStr);
  }

  dateFilterPredicate(targetStr) {
    let findStr = this.state.dateFilter;
    return this.subStringPredicate(findStr, targetStr);
  }

  render() {
    let {questions, isStudent} = this.props;

    return (
      <div className="container">
        <Helmet title="Список вопросов"/>
        <h1>Список вопросов</h1>
        {!isStudent &&
        <Col xs={12} lg={3} md={3} sm={4}>
          <Button onClick={() => this.props.pushState('/addQuestion')}>Добавить вопрос</Button>
        </Col>
        }
        <Col xs={12} sm={12} md={12} lg={12}>
          {
            Array.isArray(questions) && questions.length > 0 &&
            <Table responsive>
              <thead>
              <tr>
                <th>
                <span>Название</span>
                <Input type="text" placeholder="Фильтр по названию"
                       value = {this.state.nameFilter} onChange = {({target})=>{this.setState({nameFilter: target.value})}}/>
              </th>
              <th>
                <span> Дата создания</span>
                <Input type="text" placeholder="Фильтр по дате"
                       value = {this.state.dateFilter} onChange = {({target})=>{this.setState({dateFilter: target.value})}}/>
              </th>
              </tr>
              </thead>
              <tbody>
              {
                questions
                .filter(question => this.nameFilterPredicate(question.question))
                .filter(question => this.dateFilterPredicate(moment(new Date(question.created)).calendar().toString()))
                .map(question =>
                  <tr key={question._id}>
                    <td className="katexable"><Link to={`/questionPreview/${question._id}`}>{question.question}</Link></td>
                    <td>{moment(new Date(question.created)).calendar()}</td>
                  </tr>
                )
              }
              </tbody>
            </Table>
          }
          {
            !(Array.isArray(questions) && questions.length > 0) &&
            <div>Пока вопросов еще нет. Вы можете <Link to="/addQuestion">создать первый</Link>.</div>
          }
        </Col>
      </div>
    );
  }
}
