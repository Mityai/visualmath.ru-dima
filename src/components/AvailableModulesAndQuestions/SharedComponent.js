import React, {Component, PropTypes} from 'react';

import {Input, Table} from 'react-bootstrap'
import {Link} from 'react-router';

import {findDOMNode} from 'react-dom'
import compileKatex from 'utils/compileKatex'

export default class SharedComponent extends Component {
  static propTypes = {
    modules: PropTypes.array,
    onAdd: PropTypes.func.isRequired,
    elementsOnPage: PropTypes.number,
    selectedIds: PropTypes.array,
  };

  static defaultProps = {
    modules: [],
    elementsOnPage: 10,
    selectedIds: []
  };

  state = {
    modules: this.props.modules,
    page: 0,
    searchQuery: '',
  };

  componentDidMount() {
    compileKatex(findDOMNode(this))
  }

  componentDidUpdate() {
    compileKatex(findDOMNode(this))
  }

  filteredModules() {
    let query = this.state.searchQuery.toLowerCase()

    return this.state.modules
      .filter(module => {
        let name = module.name || module.question || ''
        return name.toLowerCase().includes(query)
      })
  }

  pagesNumber() {
    let {elementsOnPage} = this.props.elementsOnPage
    return Math.ceil(this.filteredModules().length / elementsOnPage)
  }

  lastPageNumber() {
    return this.pagesNumber() - 1
  }

  nextPage() {
    let page = this.state.page + 1
    this.setState({page})
  }

  previousPage() {
    let page = this.state.page - 1
    this.setState({page})
  }

  render() {
    let styles = require('./SharedComponent.scss')
    let {onAdd, elementsOnPage, selectedIds} = this.props
    let {page} = this.state

    let navigator = (
      <div className={styles['navigation-container']}>
        <button className={'btn ' + styles.button} onClick={() => this.previousPage()}>Предыдущие</button>
        <button className={'btn ' + styles['button-forward'] + ' ' + styles.button} onClick={() => this.nextPage()}>Следующие</button>
      </div>
    )

    if (this.pagesNumber() === 1 || this.pagesNumber() === 0) {
      navigator = null
    } else if (page === 0) {
      navigator = (
        <div className={styles['navigation-container']}>
          <button className={'btn ' + styles['button-forward'] + ' ' + styles.button} onClick={() => this.nextPage()}>Следующие</button>
        </div>
      )
    } else if (page === this.lastPageNumber()) {
      navigator = (
        <div className={styles['navigation-container']}>
          <button className={'btn ' + styles.button} onClick={() => this.previousPage()}>Предыдущие</button>
        </div>
      )
    }

    const modulesElements = this.filteredModules()
      .slice(page * elementsOnPage, (page + 1) * elementsOnPage)
      .filter(it => !it.hidden)
      .map(module => (
        <tr className={selectedIds.indexOf(module._id) > -1 ? 'success' : ''} key={module._id}>
          <td className="katexable"><Link to={`/modulePreview/${module._id}`}>{module.name || module.question}</Link></td>
          <td><a style={{cursor: 'pointer'}} onClick={() => {
            onAdd(module)
            this.setState({choiced: module._id})
          }}>+</a></td>
        </tr>
      ));

    return (
      <div className={styles['modules-container']}>
        <div className={styles['search-container']}>
        {
          this.state.modules.length !== 0 && <Input type="text"
            placeholder="Поиск"
            onChange={({target: {value}}) => {
              this.setState({ searchQuery: value, page: 0 })
            }}
          />
        }
        </div>
        {
          modulesElements.length === 0 && this.state.modules.length === 0 &&
          <span>Пока нет ни одного элемента.</span>
        }
        {
          modulesElements.length === 0 && this.state.modules.length !== 0 &&
          <span>Ничего не найдено.</span>
        }
        <Table>
          <tbody ref="list">
          {
            modulesElements.length !== 0 &&
            modulesElements
          }
          </tbody>
        </Table>
        {navigator}
      </div>
    );
  }
}
