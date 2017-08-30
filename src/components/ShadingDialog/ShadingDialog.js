/**
 * Created by booolbash on 23.08.16.
 */
import React, {PropTypes, Component} from 'react'

/*
  Компонент для отображения затемнения и диалогового окна.
  Имеет свойство title которое будет отображено в шапке компонента,
  закрывается при нажатии на крестик.
  Для работоспособности, необходимо, чтобы zIndex остальных компонент
   не превосходил 24.
   Содержимое диалога должно быть сгенерированно как дочерние компоненты диалога.
*/
export default class ShadingDialog extends Component{

  static propTypes= {
    title: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
  }

  getInitialState(){
    let color;
    if(this.props.color && /#[A-Fa-f0-9]{6}/.test(this.props.color)){
      color = this.props.color
    }
    return {
      shown: false,
      color: color || "#000000"
    }
  }

  getShadeStyle(){
    if(this.state && this.state.shown){
      return {
        display: "block",
        zIndex: 25,
        position: "fixed",
        top: "0px",
        left: "0px",
        width: "100%",
        heiht: "100%",
        opacity: "0.6",
        backgroundColor: this.state.color
      };
    }else{
      return {
        zIndex: 0,
        display: "none"
      };
    }
  }

  getDialogStyle(){
    if(this.state && this.state.shown) {
      return {
        display: "block",
        zIndex: 26,
        position: "fixed",
        top: "10%",
        left: "30%",
        borderStyle: "solid",
        borderColor: "black",
        borderWidth: "3px",
        backgroundColor: "#4f5257",
        padding: "5px"
      };
    }else{
      return {
        display: "none",
        zIndex: 0
      };
    }
  }

  getTitleStyle(){
    return {
      borderStyle: "outset",
      borderWidth: "0px 0px 3px",
      padding: "3px"
    }
  }

  closeDialog(){
    this.setState({
      open: false
    });
  }

  render(){
    return <div style={this.getShadeStyle()}>
               <div style ={this.getDialogStyle()}>
                 <div style={getTitleStyle()}>
                   {`${this.props.title}    `}
                   <button onClick={()=>this.closeDialog()}>
                     X
                   </button>
                 </div>
                 <div style={{display: "block", padding: "3px"}}>
                     {this.props.children}
                 </div>
               </div>
           </div>
  }
}