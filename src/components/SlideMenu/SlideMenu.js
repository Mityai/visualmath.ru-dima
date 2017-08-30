/**
 * Created by booolbash on 23.08.16.
 */
import React, {PropTypes, Component} from 'react'
/*
  Компонент для отображения списка слайдов лекции
  слайды должны быть сгенерированны, как потомки внутри
  тела компонента.
 */
export default class SlideMenu extends Component {

  getInitialState(){
    return {
      hidden: false
    }
  }

  toggleMenu(){
    this.setState({
      hidden: !this.state.hidden
    });
  }

  getOpenButtonStyle(){
    return {
      padding: "5px",
      borderStyle: "solid",
      backgroundColor: "grey",
      borderWidth: "3px",
      borderColor: "black",
      zIndex: 2,
      position: "absolute",
      right: "0px",
      top: "0px"
    }
  }
  getMenuStyle(){
    return {
      width: this.props.width || "20%",
      height: "100%",
      borderStyle: "outset",
      borderWidth: " 1px 1px 1px 7px",
      borderColor: "black"
    }
  }

  getHeadStyle(){
    return {
      padding: "3px",
      borderStyle: "solid",
      borderWidth: "0px 0px 3px",
      borderColor: "black",
      display: "block"
    }
  }

  getContentStyle(){
    return {
      overflowY: "scroll",
      display: "block"
    }
  }

  render(){
       return (this.state && this.state.hidden)
               ? <button style = {this.getOpenButtonStyle()}onClick = {()=>this.toggleMenu()}>
                    Меню слайдов
                 </button>
               : <div style = {this.getMenuStyle()}>
                   <div style = {this.getHeadStyle()}>
                     Слайды <button onClick={()=>this.toggleMenu()}>Скрыть</button>
                   </div>
                   <div style = {this.getContentStyle()}>
                     {this.props.children}
                   </div>
                 </div>
   }
}