import React, {Component, PropTypes} from 'react';

export default class ImageInputForm extends Component {
  static propTypes = {
    onImageUpload: PropTypes.func.isRequired,
  };

  state = {
    file: '',
    imagePreviewUrl: '',
  }

  uploadImage(target) {
    let reader = new FileReader();
    let file = target.files[0];

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result,
      });
      let obj = {};
      obj[this.state.imagePreviewUrl] = file.name;
      this.props.onImageUpload(obj);
    }

    reader.readAsDataURL(file);
  }

  render() {
    return (
      <form name="form_input" encType="multipart/form-data">
        <br/>
        <span style={{fontWeight: 'bold'}}> Графические файлы </span>
        <label className="btn btn-primary btn-sm"> Выбрать файл
          <input
            type="file"
            style={{display: 'none'}}
            onChange={({target}) => this.uploadImage(target)}/>
        </label>
        <br/>
      </form>
    );
  }
}
