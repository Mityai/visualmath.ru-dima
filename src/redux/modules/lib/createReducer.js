export default function (initialState, handlers) {
  return (state = initialState, action) => {
    let handler = handlers[action.type];
    
    if (!handler) {
      return state;
    }
    
    return handler(state, action); 
  };
}
