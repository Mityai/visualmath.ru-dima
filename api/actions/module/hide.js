import {Module} from '../../models/module'
import {access} from '../../utils/access'
import {ADMIN} from  '../../utils/roleLevels'

export let query = async req => {
  console.info('module/hide')
  console.info(`id: (${req.body.id})`)
  
  let module = await Module.findOne({_id: req.body.id}).populate('author', '-hashedPassword')
  console.info(`module found. id: (${module._id})`)
  
  module.hidden = true
  
  return await module.save()
}

export default access(
  ADMIN,
  query
)
