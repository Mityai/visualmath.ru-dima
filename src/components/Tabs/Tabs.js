import React, {Component, PropTypes} from 'react'
import SwipeableViews from 'react-swipeable-views'

let styles = {
  tabs: {
    flex: '1',
    minHeight: '100%',
    display: 'flex',
    flexFlow: 'column nowrap',
    marginBottom: '0.5em'
  },
  tabsUl: {
    flex: 1,
    display: 'flex',
    flexFlow: 'row nowrap',
    margin: 0,
    padding: 0
  },
  tab: {
    display: 'inline',
    paddingTop: '15px',
    flex: 1,
    textAlign: 'center',
    cursor: 'pointer'
  },
  ink: {
    transitionDuration: '0.2s',
    ransitionTimingFunction: 'ease-in-out',
    height: '4px',
    backgroundColor: '#5E88B5',
    borderRadius: '5px'
  }
}

export default class Tabs extends Component {
  static propTypes = {
    names: PropTypes.array.isRequired,
    children: PropTypes.any.isRequired,
    tabsIndex: PropTypes.number
  }

  constructor(props) {
    super(props)
    let tabsIndex = props.tabsIndex || 0
    this.state = {
      translation: tabsIndex * this.getPageWidthPerCent(),
      tabsIndex
    }
  }

  getPageWidthPerCent() {
    return 100 / React.Children.count(this.props.children)
  }

  getTranslation() {
    return (this.state.tabsIndex || 0) * this.getPageWidthPerCent()
  }

  handleChangeTab(tabsIndex) {
    this.setState({tabsIndex})
  }

  render() {
    let {names, children} = this.props
    let {tabsIndex} = this.state
    let translation = this.getTranslation()
    let pageWidthPerCent = this.getPageWidthPerCent()

    let extendedInkStyle = Object.assign({}, styles.ink, {
      width: pageWidthPerCent + '%',
      marginLeft: translation + '%',
      transitionProperty: 'all'
    })

    return (
      <div>
        <div style={styles.tabs}>
          <ul style={styles.tabsUl}>
            {names.map((name, index) => (
              <li key={name} style={styles.tab} onClick={() => this.handleChangeTab(index)}>
                {name}
              </li>
            ))}
          </ul>
          <div style={extendedInkStyle} />
        </div>
        <SwipeableViews
          index={tabsIndex}
          onChangeIndex={this.handleChangeTab}
          containerStyle={{height: '100%'}}
        >
          {children}
        </SwipeableViews>
      </div>
    )
  }
}
