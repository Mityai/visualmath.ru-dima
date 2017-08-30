/**
 * Created by booolbash on 19.07.16.
 */
import {Lecture} from '../../models/lecture'
import {access} from '../../utils/access'
import {ADMIN} from '../../utils/roleLevels'

export let query = async req => {
  console.info('lectures/hide')
  console.info(`id: (${req.body.id})`)
  let lecture = await Lecture.findOne({_id: req.body.id}).populate('author', '-hashedPassword')
  console.info(`lecture find. id: (${lecture._id})`)

  lecture.hidden = true

  return await lecture.save()
}

export default access(ADMIN, query)
