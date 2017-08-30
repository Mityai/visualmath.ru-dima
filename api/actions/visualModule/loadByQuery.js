import {VisualModule} from '../../models/visualModule'
import {access} from '../../utils/access'
import {STUDENT} from  '../../utils/roleLevels'

export let query = req => {
  let query = req.body.query || {}
  console.info('visualModule/loadByQuery')
  console.info({query})

  query.name = new RegExp(query.name, 'i')

  return VisualModule.find(query)
    // .populate('author', '-hashedPassword')
    .exec()
    .then(visualModules => {
      console.info(`visual modules found: ${visualModules.length}`)
      console.info(visualModules.map(({_id}) => _id))
      return visualModules
    })
}

export default access(
  STUDENT,
  query
)
