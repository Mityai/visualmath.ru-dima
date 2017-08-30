import React, {Component, PropTypes} from 'react'
import {findDOMNode} from 'react-dom'
import {connect} from 'react-redux'
import Helmet from 'react-helmet'
import moment from 'moment'
// moment.locale('ru')

import {Link} from 'react-router'
import Button from 'react-bootstrap/lib/Button'
import Table from 'react-bootstrap/lib/Table'
import Input from 'react-bootstrap/lib/Input'
import Col from 'react-bootstrap/lib/Col'

import {asyncConnect} from 'redux-async-connect'
import {load as loadModules, getModules, findModule, hide as hideModule} from 'redux/modules/modules'
import {routeActions} from 'react-router-redux'

import compileKatex from 'utils/compileKatex'


@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch}}) => {
    return dispatch(loadModules())
  }
}])
@connect(
  state => ({
    modules: getModules(state),
    isStudent: state.auth.user.role === 'student'
  }),
  {loadModules, findModule, hideModule, pushState: routeActions.push}
)
export default class ModulesList extends Component {
  static propTypes = {
    modules: PropTypes.any.isRequired,
    findModule: PropTypes.func.isRequired,
    hideModule: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    isStudent: PropTypes.bool.isRequired
  }

  state = {
    nameFilter: '',
    authorFilter: '',
    dateFilter: ''
  };

  componentDidMount() {
    compileKatex(findDOMNode(this))
  }

  componentDidUpdate() {
    compileKatex(findDOMNode(this))
  }

  search(textQuery) {
    this.props.findModule({name: textQuery})
  }

  searchEvent(event) {
    event.preventDefault()
    this.search(this.state.query)
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

  authorFilterPredicate(targetStr) {
    let findStr = this.state.authorFilter;
    return this.subStringPredicate(findStr, targetStr);
  }

  dateFilterPredicate(targetStr) {
    let findStr = this.state.dateFilter;
    return this.subStringPredicate(findStr, targetStr);
  }

  render() {
    let {modules: {data}, isStudent} = this.props

    return (
      <div className="container">
        <Helmet title="Список модулей"/>
        <h1>Список модулей</h1>
        <form onSubmit={::this.searchEvent}>
          <Col xs={12} lg={3} md={3} sm={4}>
            <Input type="text" placeholder="Поиск модуля"
                   onChange={({target}) => { this.setState({ query: target.value }); this.search(target.value) }}/>
          </Col>
        </form>
        {!isStudent &&
        <Col xs={2} lg={2} md={2} sm={2}>
          <Button onClick={() => this.props.pushState('/addModule')}>Добавить модуль</Button>
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
                         value = {this.state.nameFilter} onChange = {({target})=>{this.setState({nameFilter: target.value})}}/> </th>
                <th>
                  <span>Автор</span>
                  <Input type="text" placeholder="Фильтр по автору"
                         value = {this.state.authorFilter} onChange = {({target})=>{this.setState({authorFilter: target.value})}}/></th>
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
                  .filter(module => !module.hidden)
                  .filter(module => this.nameFilterPredicate(module.name))
                  .filter(module => this.authorFilterPredicate(module.author.username))
                  .filter(module => this.dateFilterPredicate(moment(new Date(module.created)).calendar().toString()))
                  .map(module =>
                  <tr key={module._id}>
                    <td className="katexable"><Link to={`/modulePreview/${module._id}`}>{module.name}</Link></td>
                    <td>{module.author.username}</td>
                    <td>{moment(new Date(module.created)).calendar()}</td>
                    <td><Button onClick={() => this.props.hideModule(module._id)}>удалить</Button></td>
                  </tr>
                )
              }
              </tbody>
            </Table>
          }
          {
            !(Array.isArray(data) && data.length > 0) &&
            <div>Пока модулей еще нет. Вы можете <Link to="/addModule">создать первый</Link>.</div>
          }
        </Col>
      </div>
    )
  }
}
