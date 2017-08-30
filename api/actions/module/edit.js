import {Module} from '../../models/module'
import {access} from '../../utils/access'
import {ADMIN} from  '../../utils/roleLevels'

function moduleSet(module, prop, value) {
  if (value) {
    console.info(`setting ${prop} = ${value}`)
    module[prop] = value
  }
}

export let error = {
  notFound: `cannot find the module`
}

export let query = async ({body: {id, text, name, visualModule, images, imagesLeft, imagesTop, imagesScale}}) => {
  console.info('module/edit')
  console.info(`id (${id})`)
  let module = await Module.findOne({_id: id}).exec()

  if (!module) {
    console.error('module not found')
    return Promise.reject(error.notFound)
  }

  moduleSet(module, 'content', text)
  moduleSet(module, 'name', name)
  moduleSet(module, 'visualModule', visualModule)
  moduleSet(module, 'images', images)
  moduleSet(module, 'imagesTop', imagesTop)
  moduleSet(module, 'imagesLeft', imagesLeft)
  moduleSet(module, 'imagesScale', imagesScale)

  console.info('updating module')
  return await module.save()
}

export default access(ADMIN, query)
