/**
 * Created by booolbash on 23.08.16.
 */
import React, {PropTypes, Component} from 'react'

/*Компонента для выбора модуля по имени,
  темы модуля/лекции или курса модуля/лекции.
  Имеет обязательный параметр onChange.
  Не может иметь потомков.
*/
export default class SearchComponent extends Component {

  /*onChange - функция от text и callback, в конце поиска,
  возвращает в callback массив строк ближайшего совпадения(скажем 5).
  */

  static propTypes = {
    onChange: PropTypes.func.isRequired
  }

  displayData(data){
    this.setState({data: data});
  }

  getHelpStyle(){
      return {
         display: this.state && this.state.data && this.state.data.length ? "block" : "none"
      };
  }


  render(){
    return <div>
               <Input onChange = {({target}) => {
                       this.props.onChange(target.value, this.displayData.bind(this));
                       this.setState({query: target.value});
                      }}
                      type="text" style={ {display: "block"}}/>
               <div style={getHelpStyle()}>
                 {this.state && this.state.data instanceof Array &&
                  this.state.data.map(item => {
                     return <p> <a onClick = {this.setState({query: item, data:[]})}> item </a></p>
                  })
                 }
               </div>
           <div>
  }
}