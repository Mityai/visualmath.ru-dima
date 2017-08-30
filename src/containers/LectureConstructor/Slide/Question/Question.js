import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { Input, Button } from 'react-bootstrap/lib'
import { QuestionPreview } from './QuestionPreview'

export class Question extends Component {
  render() {
    let answers = this.props.content.get('answers')
    let correctAnswers = this.props.content.get('correctAnswers')
    let multipleChoice = this.props.content.get('multiple')
    let images = this.props.content.get('images')
    let imagesLeft = this.props.content.get('imagesLeft')
    let imagesTop = this.props.content.get('imagesTop')
    let imagesScale = this.props.content.get('imagesScale')
    let isAnswerSymbolic = this.props.content.get('isAnswerSymbolic')

    let editImages = this.props.setImages
    let upload = this.props.saveImages

    if (isAnswerSymbolic) {
      answers = answers.slice(0, 1)
    }

    return (
      <div style={{marginTop: '10px', display: 'flex'}}>
        <div style={{flex: 1}}>
          <Input type="textarea"
                style={{resize: 'none'}}
                placeholder="Формулировка вопроса"
                value={this.props.question}
                onChange={({target: {value}}) => this.props.setName(value)}
          />
          <Input type="checkbox"
                label="Символьный ответ"
                checked={isAnswerSymbolic}
                onChange={({target: {checked}}) => this.props.makeAnswerSymbolic(checked)}
          />
          {
            answers.map((answer, id) =>
              <div key={id}>
                <Input type="textarea"
                  style={{resize: 'none'}}
                  placeholder="Вариант ответа"
                  value={answer}
                  onChange={({target: {value}}) => this.props.setAnswer(id, value)}
                  addonAfter={!isAnswerSymbolic &&
                    <input type="checkbox"
                      disabled={answer === ''}
                      checked={correctAnswers.contains(id)}
                      onChange={({target: {checked}}) => this.props.checkCorrectAnswer(id, checked)} />
                  }
                />
              </div>
            )
          }
          {!isAnswerSymbolic &&
            <Input type="checkbox"
                label="Разрешить отмечать несколько вариантов ответа"
                disabled={correctAnswers.size > 1}
                checked={multipleChoice}
                onClick={({target: {checked}}) => this.props.toggleMultipleChoice(checked)}
          />}

          <Input type="file" label="Question Image" name="image" accept="image/*"
            onChange={({target})=>{
              let file = target.files[0];
              // let dirName = this.props.question._id || 'new' + Date.now();
              let dirName = 'new' + Date.now();
              let path = ['questions', dirName];
              let fileName = file.name;
              let reader = new FileReader();
              reader.onload = event => {
                let data = event.target.result;
                upload({fileName, data, path}).then( () => {
                  let _images = images.push('/api/loadStatic?file=' + path.join('/') + '/' + fileName);
                  let _imagesLeft = imagesLeft.push(0);
                  let _imagesTop = imagesTop.push(0);
                  let _imagesScale = imagesScale.push(1);
                  editImages({_images, _imagesLeft, _imagesTop, _imagesScale});
                }, error => console.log(error));
              }
              reader.readAsDataURL(file);
            }}
          />

          {
            images && images.map((image, count, imgs) =>
              <div key={count} style={{display: 'block'}}>
                <Button key={count} className="btn-danger"
                  onClick = {() => {
                    let _images = imgs.splice(count, 1);
                    let _imagesLeft = imagesLeft.splice(count, 1);
                    let _imagesTop = imagesTop.splice(count, 1);
                    let _imagesScale = imagesScale.splice(count, 1);
                    editImages({_images, _imagesLeft, _imagesTop, _imagesScale});
                  }
                }> 
                  {image.split('/').pop()} 
                </Button>
                <Input type="range" min="1" max="1000" step="1" value={imagesScale.get(count) || 400}
                  onChange={({target})=>{
                    let val = target.value
                    let _imagesScale = imagesScale.set(count, parseInt(val, 10))
                    let _imagesLeft = imagesLeft
                    let _imagesTop = imagesTop
                    let _images = images
                    editImages({_images, _imagesLeft, _imagesTop, _imagesScale});
                  }}
                />
              </div>
            )
          }
        </div>
          
        <QuestionPreview {...this.props} />  
      </div>
    );
  }
}


Question.propTypes = {
  content: PropTypes.object.isRequired,
  question: PropTypes.string.isRequired,
  setName: PropTypes.func.isRequired,
  setAnswer: PropTypes.func.isRequired,
  checkCorrectAnswer: PropTypes.func.isRequired,
  toggleMultipleChoice: PropTypes.func.isRequired,
  saveImages: PropTypes.func.isRequired,
  setImages: PropTypes.func.isRequired,
  makeAnswerSymbolic: PropTypes.func.isRequired,
}

export function mapStateToProps() {
  return {}
}

export let bindFunctions = {}

export default connect(mapStateToProps, bindFunctions)(Question)
