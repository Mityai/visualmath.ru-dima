import React, {Component, PropTypes} from 'react'
import {Button,
  ButtonGroup,
  ButtonToolbar,
  Tab,
  Tabs} from 'react-bootstrap/lib/'

import {tabNames as titles, tabContent as tabs} from './TeXFunctions'

export default class FunctionTabBar extends Component {
  static propTypes = {
    onButtonClick: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.mathPics = {}
  }

  state = {
    key: titles[0]
  }

  componentWillMount() {
    let katex;
    if (global.window) {
      katex = global.window.katex
    } else {
      return;
    }

    titles.forEach(title => {
      tabs[title].forEach(formulaBlocks => {
        formulaBlocks.forEach(formulaBlock => {
          formulaBlock.forEach(formula => {
            if (tabs.atypicalNoRender[formula]) {
              this.mathPics[formula] = tabs.atypicalNoRender[formula]
              return
            }
            this.mathPics[formula] = tabs.noRender.indexOf(formula) === -1 ?
            katex.renderToString(formula, {displayMode: false, throwOnError: false})
            : formula
          })
        })
      })
    })
  }


  handleSelect = (key) => {
    switch (key) {
      default:
        this.setState({key})
    }
  }

  render() {
    let onClick = this.props.onButtonClick
    return (
      <Tabs onSelect={this.handleSelect}
            activeKey={this.state.key}
            ref={ref => this.tabBar = ref}>
        {titles.map((title) =>
          <Tab title={title}
               eventKey={title}
               key={title}>
            <ButtonToolbar>
              {tabs[title].map((formulaBlocks) =>
                formulaBlocks.map(formulaBlock =>
                  <span>
                    <ButtonGroup
                      vertical
                      key={title + formulaBlocks + formulaBlock}>
                      {formulaBlock.map(formula =>
                        <Button bsStyle="link"
                                bsSize={title === 'Typeface' ? null : 'xsmall'}
                                key={title + formulaBlocks + formulaBlock + formula}
                                onClick={(ev) => {
                                  ev.stopPropagation()
                                  ev.preventDefault()
                                  ev.stopImmediatePropagation()
                                  let cmd = tabs.atypicalRender[formula] || formula
                                  if (Array.isArray(cmd)) {
                                    onClick.apply(null, cmd, null, null)
                                  } else {
                                    onClick.bind(null, cmd, null, null, null)()
                                  }
                                }}>
                          <span dangerouslySetInnerHTML={{__html: this.mathPics[formula]}}/>
                        </Button>
                      )}
                    </ButtonGroup>
                    {formulaBlocks[formulaBlocks.length - 1] === formulaBlock ?
                      <span dangerouslySetInnerHTML={{__html: '&nbsp'}} /> : ''}
                  </span>
                )
              )}
            </ButtonToolbar>
          </Tab>
        )}
      </Tabs>
    );
  }
}
