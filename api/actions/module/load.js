import {Module} from '../../models/module'
import {access} from '../../utils/access'
import {STUDENT} from '../../utils/roleLevels'

export let errors = {
  moduleNotFound: id => `Модуль не найден (id: ${id})`,
}

export let query = async ({ body: { id } }) => {
  console.info('module/load')
  console.info(`id: (${id})`)
  let module = await Module.findOne({_id: id})
    .populate('author', '-hashedPassword')
    .exec()

  if (!module) {
    console.error(errors.moduleNotFound(id))
    return Promise.reject(errors.moduleNotFound(id))
  }
  
  console.info(`module found. id: (${module._id})`)
  return module
}

export default access(
  STUDENT,
  query
)
