import React, {Component, PropTypes} from 'react'
import {Input, Button} from 'react-bootstrap/lib'

class EditQuestion extends Component {
  state = {
    userEnabledSymbolicAnswer: this.props.question.isAnswerSymbolic,
    userEnabledMultipleChoice: false
  }

  render() {
    let {question: {question, answers, isAnswerSymbolic, correctAnswers, images, imagesLeft, imagesScale, imagesTop, difficulty},
      editQuestionText, editAnswers, editCorrectAnswers, editDifficulty, save, editImages, upload, setAnswerSymbolic} = this.props
    let conditionalMultipleChoiceChecked = correctAnswers.length > 1;
    let {userEnabledMultipleChoice} = this.state

    return (
      <div>
        <Input type="textarea"
                style={{resize: 'none'}}
                placeholder="Формулировка вопроса"
                label="Вопрос"
                value={question}
                onChange={({target: {value}}) => {
                  console.log('call editQuestionList');
                  editQuestionText(value);
                }}
        />
        <br/>
        <Input type="checkbox"
                label="Символьный ответ"
                checked={this.state.userEnabledSymbolicAnswer}
                onChange={({target: {checked}}) => {
                  this.setState({userEnabledSymbolicAnswer: checked});
                  setAnswerSymbolic(checked);
                }}
        />
        {
          answers.map((answer, id) =>
            (id < 1 || !isAnswerSymbolic) && <div key={id}>
              <Input type="textarea"
                      style={{resize: 'none'}}
                      placeholder={isAnswerSymbolic ? 'Ответ' : 'Вариант ответа'}
                      value={answer}
                      onChange={({target: {value}}) => editAnswers(value, id)}
                      addonAfter={!isAnswerSymbolic &&
                        <input type="checkbox"
                              disabled={answer === '' || !userEnabledMultipleChoice &&
                              correctAnswers.length >= 1 &&
                              correctAnswers.indexOf(id) === -1}
                              checked={correctAnswers.indexOf(id) > -1}
                              onChange={({target: {checked}}) => editCorrectAnswers(checked, id)}/>
                      }
              />
            </div>
          )
        }
        {!isAnswerSymbolic && <Input type="checkbox"
                label="Разрешить отмечать несколько вариантов ответа"
                value={answers}
                disabled={correctAnswers.length > 1}
                checked={conditionalMultipleChoiceChecked ||
                  userEnabledMultipleChoice}
                onClick={({target: {checked}}) => this.setState(
                  {userEnabledMultipleChoice: checked})}
        />}
        <Input type="file" label="Question Image" name="image" accept="image/*"
                onChange={({target})=>{
                  let file = target.files[0];
                  let dirName = this.props.question._id || 'new' + Date.now();
                  let path = ['questions', dirName];
                  let fileName = file.name;
                  let reader = new FileReader();
                  reader.onload = event => {
                    let data = event.target.result;
                    upload({fileName, data, path}).then( ()=>{
                      images.push('/api/loadStatic?file=' + path.join('/') + '/' + fileName);
                      imagesLeft.push(0);
                      imagesTop.push(0);
                      imagesScale.push(1);
                      editImages({images, imagesLeft, imagesTop, imagesScale});
                    }, error => console.log(error));
                  }
                  reader.readAsDataURL(file);
                }}/>
        {images && images.map((image, count, imgs)=>
          <div key={count} style={{display: 'block'}}>
            <Button key={count} className="btn-danger" onClick = {()=>{
              imgs.splice(count, 1);
              imagesLeft.splice(count, 1);
              imagesTop.splice(count, 1);
              imagesScale.splice(count, 1);
              editImages({images, imagesLeft, imagesTop, imagesScale})
            }}>{image.split('/').pop()}</Button>
            <Input type="range" min="1" max="1000" step="1" value={imagesScale[count] || 400}
              onChange={({target})=>{
                let val = target.value;
                imagesScale[count] = parseInt(val, 10);
                editImages({images, imagesLeft, imagesTop, imagesScale});
              }
            }/>
          </div>
        )}
        <Input type="textarea"
               style={{resize: 'none'}}
               label="Сложность"
               value={difficulty}
               onChange={({target: {value}}) => {
                 console.log('call editDifficulty');
                 editDifficulty(value);
               }}
        />
        <br/>
        <button type="button" className="btn btn-primary" onClick={save}>Сохранить</button>
      </div>
    )
  }
}

EditQuestion.propTypes = {
  question: PropTypes.object,
  editQuestionText: PropTypes.func,
  editAnswers: PropTypes.func,
  editCorrectAnswers: PropTypes.func,
  editImages: PropTypes.func.isRequired,
  editDifficulty: PropTypes.func,
  setAnswerSymbolic: PropTypes.func,
  upload: PropTypes.func.isRequired,
  save: PropTypes.func,
}

export default EditQuestion

