import {VisualModule} from '../../models/visualModule'
import {access} from '../../utils/access'
import {TEACHER} from '../../utils/roleLevels'

export let errors = {
  name: 'name должно быть определено',
  description: 'description должен быть определен',
  script: 'script должен быть определен',
  savingError: `ошибка во время сохранения`
}

export let query = async({body}, res, user) => {
  console.info('visualModule/add')

  if (!body.name) {
    console.error('name must be defined')
    return Promise.reject(errors.name)
  }
  if (!body.description) {
    console.error('description must be defined')
    return Promise.reject(errors.description)
  }
  if (!body.script) {
    console.error('script must be defined')
    return Promise.reject(errors.script)
  }

  console.info('author', user._id)
  console.info('name', body.name)
  console.info('description', body.description)
  console.info('script', body.script)

  let visualModule = new VisualModule({
    author: user._id,
    name: body.name,
    description: body.description,
    script: body.script
  })

  console.info('saving visual module')
  return await visualModule.save()
}

export default access(
  TEACHER,
  query
)
