/**
 * Created by booolbash on 23.08.16.
 */
import React, {PropTypes, Component} from 'react'

/* Компонент для отображения пагинации
   Имеет неободимые параметры pages - число страниц
   и onChange.
   Не может иметь потомков.
 */
export default class Pagination extends Component{

  /*
     onChange - зависит от числа страницы на которую переходит
     переключание, выполняет необходимые действия
   */

  static propTypes = {
    pages: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
  }

  getInitialState(){
    return {
      current: 1,
      pages: this.props.pages
    };
  }

  setPage(number, onChange){
    if(number == "<"){
      this.setState({current: this.state.current-1});
      onChange(this.state.current-1);
    }else if(number == ">"){
      this.setState({current:this.state.current+1});
      onChange(this.state.current+1);
    }else{
      this.setState({current: +number});
      onChange(+number);
    }
  }

  getItemStyle(number){
    if(this.state){
      return this.state.current == +number ? {color: "#3c35fc"} : {color: "#7e7af0"}
    }
  }

  getItems(onChange, pages){
    let data = [];
    if(this.state && this.state.current != 1){
      data.push("<");
    }
    for(let i = 0; i < (this.state.pages || pages); ++i){
      data.push(i+1);
    }
    if(!(this.state && this.state.current == (this.state.pages || pages))){
      data.push(">");
    }
    return data.map(e => <button onClick={this.setPage.bind(this, e, onChange)} style={this.getItemStyle(e)}>
                             <span style={{color: "#ffffff"}}>e</span>
                          </button>);
  }

  render(){
    return <div>
               {this.getItems(this.props.onChange, this.props.pages)}
           </div>;
  }
}