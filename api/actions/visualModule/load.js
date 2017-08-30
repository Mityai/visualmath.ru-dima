import {VisualModule} from '../../models/visualModule'
import {access} from '../../utils/access'
import {STUDENT} from '../../utils/roleLevels'

export let errors = {
  visualModuleNotFound: id => `визуальный модуль не найден (id: ${id})`
}

export let query = async ({ body: { id } }) => {
  console.info('visualModule/load')
  console.info(`id: (${id})`)
  let visualModule = await VisualModule.findOne({_id: id}).exec()

  if (!visualModule) {
    let error = errors.visualModuleNotFound(id)
    console.error(error)
    return Promise.reject(error)
  }
  
  console.info(`visual module found. id: (${visualModule._id})`)
  return visualModule    
}

export default access(
  STUDENT,
  query
)
