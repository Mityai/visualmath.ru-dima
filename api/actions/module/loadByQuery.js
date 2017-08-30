import {Module} from '../../models/module'
import {access} from '../../utils/access'
import {STUDENT} from  '../../utils/roleLevels'

export let query = req => {
  let query = req.body.query || {}
  console.info('module/loadByQuery')
  console.info({query})

  query.name = new RegExp(query.name, 'i')

  return Module.find(query)
    .populate('author', '-hashedPassword')
    .exec()
    .then(modules => {
      console.info(`modules found: ${modules.length}`)
      console.info(modules.map(({_id}) => _id))
      return modules
    })
}

export default access(
  STUDENT,
  query
)
