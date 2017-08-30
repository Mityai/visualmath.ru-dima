import React, { Component, PropTypes } from 'react'
import {findDOMNode} from 'react-dom'
import { Link } from 'react-router'

import Helmet from 'react-helmet'
import {Button, Col, Input, Table } from 'react-bootstrap/lib'

import {connect} from 'react-redux'
import {asyncConnect} from 'redux-async-connect'

import {routeActions} from 'react-router-redux'
import moment from 'moment'

import {list as questionBlocksList, getList as getQuestionBlocksList} from 'redux/modules/questionBlocks'
import compileKatex from 'utils/compileKatex'

@asyncConnect([{
  deferred: false,
  promise: ({store: {dispatch}}) => dispatch(questionBlocksList())
}])
@connect(
  state => ({
    questionBlocks: Object.values(getQuestionBlocksList(state))
  }),
  {pushState: routeActions.push}
)
export default class BlocksList extends Component {
  state = {
    nameFilter: '',
    dateFilter: ''
  }

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
    let {questionBlocks} = this.props
    console.log(questionBlocks)
    return (
      <div className="container">
        <Helmet title="Список блоков вопросов"/>
        <h1>Список блоков</h1>
        <Col xs={12} lg={3} md={3} sm={4}>
          <Button onClick={() => this.props.pushState('/addBlock')}>Добавить блок вопросов</Button>
        </Col>
        <Col xs={12} sm={12} md={12} lg={12}>
          {
            Array.isArray(questionBlocks) && questionBlocks.length > 0 &&
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
                questionBlocks
                .filter(questionBlock => this.nameFilterPredicate(questionBlock.name))
                .filter(questionBlock => this.dateFilterPredicate(moment(new Date(questionBlock.created)).calendar().toString()))
                .map(questionBlock =>
                  <tr key={questionBlock._id}>
                    <td className="katexable"><Link to={`/questionBlockPreview/${questionBlock._id}`}> {questionBlock.name} </Link></td>
                    <td>{moment(new Date(questionBlock.created)).calendar()}</td>
                  </tr>
                )
              }
              </tbody>
            </Table>
          }
          {
            !(Array.isArray(questionBlocks) && questionBlocks.length > 0) &&
            <div>Пока блоков вопросов еще нет. Вы можете <Link to="/addBlock">создать первый</Link>.</div>
          }
        </Col>
      </div>
    )
  }
}

BlocksList.propTypes = {
  questionBlocks: PropTypes.arrayOf(PropTypes.object),
  pushState: PropTypes.func,
}
