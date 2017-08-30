import React, { PropTypes } from 'react'
import { KatexableComponent } from '../../../../utils/katexable'


export class QuestionPreview extends KatexableComponent {
  render() {
    let { content, question } = this.props

    let images = this.props.data.getIn(['content', 'images'])
    // let imagesLeft = this.props.data.getIn(['content', 'imagesLeft'])
    // let imagesTop = this.props.data.getIn(['content', 'imagesTop'])
    let imagesScale = this.props.data.getIn(['content', 'imagesScale'])
    let isAnswerSymbolic = content.get('isAnswerSymbolic')
    let answers = this.props.content.get('answers')

    if (isAnswerSymbolic) {
      answers = answers.slice(0, 1)
    }

    return (
      <div style={{flex: 1, minWidth: '50%', marginLeft: '5px'}}>
        <h2 className="katexable" style={{marginTop: 0}}>{question}</h2>

        <div style={{position: 'relative'}}>
          {images && images.map((src, count) =>
            <div>
              <img src={src} key={count} style={
                {
                  // position: 'absolute relative',
                  // left: (imagesLeft.get(count) || 0) + 'px',
                  // top: (imagesTop.get(count) || 0) + 'px',
                  width: (imagesScale.get(count) || 400) + 'px',
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }
              }
              />
              <br />
            </div>
          )}
        </div>

        <div style={{position: 'absolute'}}>
          <ul>
            {answers.map((answer, id) =>
              <li className="katexable" key={id}>{answer}</li>
            )}
          </ul>
        </div>
      </div>
    )
  }
}

QuestionPreview.propTypes = {
  question: PropTypes.string.isRequired,
  content: PropTypes.object.isRequired,
}
