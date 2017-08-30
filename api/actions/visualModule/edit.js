import {VisualModule} from '../../models/visualModule'
import {access} from '../../utils/access'
import {TEACHER} from  '../../utils/roleLevels'

function visualModuleSet(visualModule, prop, value) {
  if (value) {
    console.info(`setting ${prop} = ${value}`)
    visualModule[prop] = value
  }
}

export let error = {
  notFound: `cannot find the visual module`
}

export let query = async ({body: {id, name, description, script}}) => {
  console.info('visualModule/edit')
  console.info(`id (${id})`)
  let visualModule = await VisualModule.findOne({_id: id}).exec()

  if (!visualModule) {
    console.error('visual module not found')
    return Promise.reject(error.notFound)
  }

  visualModuleSet(visualModule, 'name', name)
  visualModuleSet(visualModule, 'description', description)
  visualModuleSet(visualModule, 'script', script)

  console.info('updating visual module')
  return await visualModule.save()
}

export default access(TEACHER, query)
