import React, {Component, PropTypes} from 'react'
import {findDOMNode} from 'react-dom'

import {asyncConnect} from 'redux-async-connect'
import {connect} from 'react-redux'

import {routeActions} from 'react-router-redux'
import {Link} from 'react-router'

import moment from 'moment'
// moment.locale('ru')

import Helmet from 'react-helmet'
import {Button, Col, Input, Table} from 'react-bootstrap/lib'

import {load as loadVisualModules, getVisualModules, findVisualModule}
  from 'redux/modules/visualModules'

import compileKatex from 'utils/compileKatex'


@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch}}) => {
    return dispatch(loadVisualModules())
  }
}])

@connect(
  state => ({
    visualModules: getVisualModules(state),
    isStudent: state.auth.user.role === 'student'
  }),
  {loadVisualModules, findVisualModule, pushState: routeActions.push}
)
export default class VisualModulesList extends Component {
  static propTypes = {
    visualModules: PropTypes.any.isRequired,
    findVisualModule: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    isStudent: PropTypes.bool.isRequired
  }

  state = {
    nameFilter: '',
    authorFilter: '',
    dateFilter: '',
    descriptionFilter: '',
  };

  componentDidMount() {
    compileKatex(findDOMNode(this))
  }

  componentDidUpdate() {
    compileKatex(findDOMNode(this))
  }

  search(textQuery) {
    this.props.findVisualModule({name: textQuery})
  }

  searchEvent(event) {
    event.preventDefault()
    this.search(this.state.query)
  }

  subStringPredicate(findString, targetString) {
    let findStr = findString.toLowerCase();
    let targetStr = targetString.toLowerCase();
    return findStr === null || findStr === '' || targetStr !== null &&
      targetStr.indexOf(findStr) !== -1;
  }

  nameFilterPredicate(targetStr) {
    let findStr = this.state.nameFilter;
    return this.subStringPredicate(findStr, targetStr);
  }

  descriptionFilterPredicate(targetStr) {
    let findStr = this.state.descriptionFilter;
    return this.subStringPredicate(findStr, targetStr);
  }

  authorFilterPredicate(targetStr) {
    let findStr = this.state.authorFilter;
    return this.subStringPredicate(findStr, targetStr);
  }

  dateFilterPredicate(targetStr) {
    let findStr = this.state.dateFilter;
    return this.subStringPredicate(findStr, targetStr);
  }

  render() {
    let {visualModules: {data}, isStudent} = this.props

    return (
      <div className="container">
        <Helmet title="Список визуальных модулей"/>
        <h1>Список визуальных модулей</h1>
        <form onSubmit={::this.searchEvent}>
          <Col xs={12} lg={3} md={3} sm={4}>
            <Input type="text" placeholder="Поиск визуального модуля"
              onChange={({target}) => {
                this.setState({ query: target.value });
                this.search(target.value)
              }} />
          </Col>
        </form>
        {!isStudent &&
          <Col xs={2} lg={2} md={2} sm={2}>
            <Button onClick={() => this.props.pushState('/addVisualModule')}>
              Добавить визуальный модуль
            </Button>
          </Col>
        }
        <Col xs={12} sm={12} md={12} lg={12}>
          {
            Array.isArray(data) && data.length > 0 &&
              <Table responsive>
                <thead>
                  <tr>
                    <th>
                      <span>Название</span>
                      <Input type="text" placeholder="Фильтр по названию"
                        value = {this.state.nameFilter} onChange = {({target})=>{this.setState({nameFilter: target.value})}}/>
                    </th>
                    <th>
                      <span>Описание</span>
                      <Input type="text" placeholder="Фильтр по описанию"
                        value = {this.state.descriptionFilter} onChange = {({target})=>{this.setState({descriptionFilter: target.value})}}/>
                    </th>
                    {/* <th>
                      <span>Автор</span>
                      <Input type="text" placeholder="Фильтр по автору"
                      value = {this.state.authorFilter} onChange = {({target})=>{this.setState({authorFilter: target.value})}}/>
                    </th> */}
                    <th>
                      <span> Дата создания</span>
                      <Input type="text" placeholder="Фильтр по дате"
                        value = {this.state.dateFilter} onChange = {({target})=>{this.setState({dateFilter: target.value})}}/>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {
                    data
                    .filter(visualModule =>
                    this.descriptionFilterPredicate(visualModule.description))
                    .filter(visualModule => this.nameFilterPredicate(visualModule.name))
                    // .filter(visualModule =>
                    //   this.authorFilterPredicate(visualModule.author.username))
                    .filter(visualModule =>
                    this.dateFilterPredicate(moment(new Date(visualModule.created))
                    .calendar().toString()))
                    .map(visualModule =>
                      <tr key={visualModule._id}>
                        <td className="katexable"><Link to={`/visualModulePreview/${visualModule._id}`}>{visualModule.name}</Link></td>
                        <td className="katexable">{visualModule.description}</td>
                        {/* <td>{visualModule.author.username}</td> */}
                        <td>{moment(new Date(visualModule.created)).calendar()}</td>
                      </tr>
                    )
                  }
                </tbody>
              </Table>
          }
          {
            !(Array.isArray(data) && data.length > 0) &&
              <div>Пока визуальных модулей еще нет. Вы можете <Link to="/addVisualModule">создать первый</Link>.</div>
          }
        </Col>
      </div>
    )
  }
}
