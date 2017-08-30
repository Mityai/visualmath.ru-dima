/**
 * Created by booolbash on 23.08.16.
 */
import React, {PropTypes, Component} from 'react'
/*
  Компонента для фильтрации по свойству модулей, лекций, вопросов,
  пользователей и т.д.(совпадение по подстроке)
  Имеет обязательное свойство onSubmit
  Не может иметь потомков.
 */
export default class FilterDropdown extends Component{
/*
   onSubmit - функция от query - текста, выполняет фильтрацию таблицы
   по подстроке. В будущем должна быть совмещена с механизмом пагинации.
 */
  static propTypes = {
    onSubmit: PropTypes.func.isRequired
  }

  toggleClick(){
    this.setState({open: !this.state.open});
  }

  getDropDownStyle(){
    return this.state && this.state.open ? {display: "block" } : {display: "none"};
  }

  getInitialState(){
    return {
      open: false,
      query: ""
    }
  }

  render(){
    return <div>
               <Button onClick={()=>this.toggleClick()} style={{display: "block"}}>
                 {this.props.children}
               </Button>
               <div  style = {this.getDropdownStyle()}>
                 <Input type="text" onChange={ ({target}) => { this.setState({ query: target.value });} }/>
                 <Button onClick={()=>this.props.onSubmit(this.state.query)}>
                   Поиск
                 </Button>
               </div>
           </div>
  }
}