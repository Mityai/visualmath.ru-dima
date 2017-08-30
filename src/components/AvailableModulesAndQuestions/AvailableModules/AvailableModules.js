import SharedComponent from '../SharedComponent.js'

const sortableOptions = {
  ref: 'list',
  model: 'modules',
  animation: 150,
  ghostClass: 'item-ghost',
  group: {
    name: 'shared'
  }
};

if (__CLIENT__) {
  let sortable = require('react-sortablejs').default
  module.exports = sortable(sortableOptions)(SharedComponent)
} else {
  module.exports = SharedComponent
}
