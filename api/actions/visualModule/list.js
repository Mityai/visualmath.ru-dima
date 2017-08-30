import {VisualModule} from '../../models/visualModule'
import {access} from '../../utils/access'
import {TEACHER} from '../../utils/roleLevels'

export let errors = {
  unexpected: `Error visualModule/list`
}

export let query = () => {
  console.info('visualModule/list')
  return VisualModule.find({})
    // .populate('author', '-hashedPassword')
    .then(visualModules => {
      console.info('visual modules are found: ', visualModules.length)
      console.info(visualModules.map(({_id}) => _id))
      return visualModules
    })
}

export default access(
  TEACHER,
  query
)
