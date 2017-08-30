import React, {Component, PropTypes} from 'react'
import {Alert, Input, Tabs, Tab, Button} from 'react-bootstrap/lib'
import FunctionTabBar from './FunctionTabBar'
// import ImageInputForm from './ImageInputForm'

// import {AvailableVisualModules} from 'components'

export default class EditModule extends Component {
  static propTypes = {
    editContent: PropTypes.func.isRequired,
    editName: PropTypes.func.isRequired,
    editVisualModule: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
    // onImageUpload: PropTypes.func.isRequired,
    module: PropTypes.any,
    visualModules: PropTypes.any,
    upload: PropTypes.func.isRequired,
    editImages: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
  }

  state = {
    validationEnabled: false,
    key: EditModule.TabTitles[0],
    imageDataChanged: false
  }

  static TabTitles = ['Текст', 'Визуальный модуль', 'Изображения']

  handleSelect(key) {
    switch (key) {
      // case:
      //   console.log()
      //   break
      default:
        this.setState({key})
    }
  }

  validateAndSave() {
    let {name, content, visualModule, images, imagesLeft, imagesTop, imagesScale} = this.props.module

    if (name.length > 0) {
      this.props.save(name, content, visualModule, images, imagesLeft, imagesTop, imagesScale);
    } else {
      this.setState({validationEnabled: true});
    }
  }

  validateModuleName() {
    let {name} = this.props.module
    if (!this.state.validationEnabled) {
      return null;
    }
    let length = name.length
    if (length === 0) return 'danger'
  }

  lastScaleUpdate = 0

  debounceScale({name, content, visualModule, images, imagesLeft, imagesTop, imagesScale}) {
    let time = Date.now();
    this.lastScaleUpdate = time;
    setTimeout(()=>{
      if (time === this.lastScaleUpdate) {
        this.props.save(name, content, visualModule, images, imagesLeft, imagesTop, imagesScale);
      }
    }, 1000)
  }

  renderButtonbar() {
    return (
      <FunctionTabBar onButtonClick={(buttonName1, buttonName2, selStart, selEnd) => {
        let {module: {content}, editContent} = this.props
        let editModule = document.getElementById('editModule')
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

  renderLabel(text) {
    return (
      <label>
        {text}
      </label>
    );
  }

  render() {
    let { module: {content, name, images, imagesLeft, imagesTop, /* , visualModule, */ imagesScale}, editName, editContent, upload, editImages} = this.props
    let { validationEnabled } = this.state
    let contentInputStyle = {
      resize: 'vertical'
    }

    return (
      <div>
        <Input type="textarea"
          style={{resize: 'vertical'}}
          ref={ref => this.nameInput = ref}
          placeholder="Название модуля"
          label="Название"
          value={name}
          onChange={(event) => editName(event.target.value)}
        />
        {
          validationEnabled && name.length === 0 &&
            <Alert bsStyle={this.validateModuleName()}>
              Введите имя
            </Alert>
        }
        {this.renderButtonbar()}
        <br />
        <Tabs onSelect={::this.handleSelect}
          activeKey={this.state.key}
          ref={ref => this.choiceTab = ref}>
          <br/>
          <Tab title="Текст"
            eventKey="Текст"
            key="Текст">
            <Input type="textarea"
              id="editModule"
              ref={ref => this.contentInput = ref}
              placeholder="Содержимое модуля"
              value={content}
              onChange={(event) => editContent(event.target.value)}
              style={contentInputStyle}
              rows={12} />
          </Tab>
          <Tab title="Изображение"
               eventKey="Изображение"
               key="Изображение">
            <Input type="file" label="Module Image" name="image" accept="image/*"
                   onChange={({target})=>{
                     let file = target.files[0];
                     let dirName = this.props.module._id || 'new' + Date.now();
                     let path = ['modules', dirName];
                     let fileName = file.name;
                     let reader = new FileReader();
                     reader.onload = event => {
                       let data = event.target.result;
                       upload({fileName, data, path}).then( ()=>{
                         images.push('/api/loadStatic?file=' + path.join('/') + '/' + fileName);
                         imagesLeft.push(0);
                         imagesTop.push(0);
                         imagesScale.push(1);
                         // this.props.save(name, content, visualModule, images, imagesLeft, imagesTop, imagesScale);
                         editImages(images, imagesLeft, imagesTop, imagesScale);
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
                 editImages(images, imagesLeft, imagesTop, imagesScale);
               }}>{image.split('/').pop()}</Button>
                <Input type="range" min="1" max="1000" step="1" value={imagesScale[count] || 400}
                onChange={({target})=>{
                  let val = target.value;
                  imagesScale[count] = parseInt(val, 10);
                  editImages(images, imagesLeft, imagesTop, imagesScale);
                  // this.debounceScale({name, content, visualModule, images, imagesLeft, imagesTop, imagesScale})
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
        <br />
        <button type="button"
                className="btn btn-primary"
                onClick={::this.validateAndSave}>
          Сохранить
        </button>
      </div>
    )
  }
}
