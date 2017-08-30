import {Module} from '../../models/module'
import {access} from '../../utils/access'
import {STUDENT} from '../../utils/roleLevels'

export let errors = {
  unexpected: `Error module/list`
}

export let query = () => {
  console.info('module/list')
  return Module.find({})
    .populate('author', '-hashedPassword')
    .then(modules => {
      console.info('modules are found: ', modules.length)
      console.info(modules.map(({_id}) => _id))
      return modules
    })
}

export default access(
  STUDENT,
  query
)
