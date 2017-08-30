import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import {Input, Tabs, Tab, Button} from 'react-bootstrap/lib'

import { TextPreview } from './TextPreview'
import FunctionTabBar from 'components/EditModule/FunctionTabBar'

export function mapStateToProps() {
  return {}
}

export let bindFunctions = {
}


export class Text extends Component {
  renderButtonbar() {
    return (
      <FunctionTabBar onButtonClick={(buttonName1, buttonName2, selStart, selEnd) => {
        let content = this.props.text
        let editContent = this.props.setText
        let editModule = document.getElementById('editModule' + this.props._id)
        editModule.focus()

        let start = editModule.selectionStart === undefined ?
            content.length : editModule.selectionStart
        let end = editModule.selectionEnd === undefined ?
            content.length : editModule.selectionEnd

        let name1 = buttonName1
        let name2 = buttonName2 || ''

        let beforeCaret = content.slice(0, start)
        let afterCaret = content.slice(end)
        let selection = content.slice(start, end)

        let newContent = beforeCaret + name1 + selection + name2 + afterCaret
        let caretStart = selStart ? start + selStart : start + name1.length
        let caretEnd = selEnd ? start + selection.length + selEnd : start + selection.length + name1.length
        editContent(newContent, caretStart, caretEnd)
      }} />
    );
  }

  render() {
    let content = this.props.text
    let editContent = this.props.setText
    let editImages = this.props.setImages
    let upload = this.props.saveImages

    let {images, imagesLeft, imagesTop, imagesScale} = this.props

    return (
      <div style={{display: 'flex', justifyContent: 'space-around'}}>
        <div style={{marginTop: '10px', flex: 1}}>
          <Input type="textarea"
            style={{resize: 'vertical'}}
            placeholder="Название нового текстового модуля"
            value={this.props.name} 
            onChange={ev => this.props.setName(ev.target.value)} />

          {this.renderButtonbar()}
          <br />
          <Tabs
            ref={ref => this.choiceTab = ref}>
            <br/>
            <Tab title="Текст"
              eventKey="Текст"
              key="Текст">
              <Input type="textarea"
                id={'editModule' + this.props._id}
                ref={ref => this.contentInput = ref}
                placeholder="Текстовый модуль"
                value={content}
                onChange={(event) => editContent(event.target.value)}
                style={{height: '150px', marginTop: '-5px', width: '100%', resize: 'vertical'}}
              />
            </Tab>
            <Tab title="Изображение"
                eventKey="Изображение"
                key="Изображение">
              <Input type="file" label="Module Image" name="image" accept="image/*"
                    onChange={({target})=>{
                      let file = target.files[0];
                      // let dirName = this.props.module._id || 'new' + Date.now();
                      let dirName = 'new' + Date.now();
                      let path = ['modules', dirName];
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
                    }}/>
              {images && images.map((image, count, imgs)=>
                <div key={count} style={{display: 'block'}}>
                <Button key={count} className="btn-danger" onClick = {()=>{
                  let _images = imgs.splice(count, 1);
                  let _imagesLeft = imagesLeft.splice(count, 1);
                  let _imagesTop = imagesTop.splice(count, 1);
                  let _imagesScale = imagesScale.splice(count, 1);
                  editImages({_images, _imagesLeft, _imagesTop, _imagesScale});
                }}>{image.split('/').pop()}</Button>
                  <Input type="range" min="1" max="1000" step="1" value={imagesScale.get(count) || 400}
                  onChange={({target})=>{
                    let val = target.value
                    let _imagesScale = imagesScale.set(count, parseInt(val, 10))
                    let _imagesLeft = imagesLeft
                    let _imagesTop = imagesTop
                    let _images = images
                    editImages({_images, _imagesLeft, _imagesTop, _imagesScale});
                  }
                }/>
                </div>
                )}

            </Tab>
            {/*
            <Tab title="Визуальный модуль"
              eventKey="Визуальный модуль"
              key="Визуальный модуль">
              <AvailableVisualModules
                modules={visualModules}
                onAdd={editVisualModule}
                elementsOnPage={5}
                selectedIds={[visualModuleId]}/>
            </Tab>
            */}
          </Tabs>
        </div>
        
        <TextPreview data={this.props} />
      </div>
    )
  }
}

Text.propTypes = {
  // from parent
  text: PropTypes.string.isRequired,
  setText: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  setName: PropTypes.func.isRequired,
  images: PropTypes.object.isRequired,
  imagesLeft: PropTypes.object.isRequired,
  imagesTop: PropTypes.object.isRequired,
  imagesScale: PropTypes.object.isRequired,
  setImages: PropTypes.func.isRequired,
  _id: PropTypes.number.isRequired,
  saveImages: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, bindFunctions)(Text)
