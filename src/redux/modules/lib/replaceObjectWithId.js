import clone from 'lodash/cloneDeep';

export default function fix(obj, _props) {
  let props = [].concat(_props);
  let fixed = clone(obj);
  
  props.forEach(prop => {
    if (typeof fixed[prop] === 'object') {
      fixed[prop] = fixed[prop]._id;
    }
    if (Array.isArray(fixed[prop])) {
      fixed[prop] = fixed[prop].map(({_id}) => _id);
    }
  });
  
  return fixed;
}
