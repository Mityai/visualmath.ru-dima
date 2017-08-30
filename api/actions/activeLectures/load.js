import {ActiveLecture} from '../../models/activeLecture'
import {access} from '../../utils/access'
import {STUDENT} from '../../utils/roleLevels'

export let errors = {
  id: 'id лекции не отправлен'
}

export let query = ({body: {id}}) => {
  console.info('activeLectures/load')
  console.info(`id: (${id})`)
  if (!id) {
    console.error(`id expected`)
    return Promise.reject(errors.id)
  }

  return ActiveLecture.findOne({_id: id})
    .populate('speaker', '-hashedPassword')
    .populate('lecture')
    .then(data => {
      console.info('user found')
      return data
    })
    .catch(error => {
      console.error(error)
      return error
    })
}

export default access(
  STUDENT,
  query
)
