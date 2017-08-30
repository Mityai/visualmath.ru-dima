import {QuestionBlock} from '../../models/questionBlock'
import {access} from '../../utils/access'
import {STUDENT} from '../../utils/roleLevels'

export let errors = {
  idIsNotDefined: 'id должен быть строкой',
  blockNotFound: id => `questionBlock (id: ${id}) не найден`
}

export let query = async ({body: {id}}) => {
  console.info('questionBlock/load')
  
  if (typeof id !== 'string') {
    console.error(errors.idIsNotDefined)
    return Promise.reject(errors.idIsNotDefined)
  }

  return await QuestionBlock.findById(id).populate('questionsIds')
}

export default access(
  STUDENT,
  query
)
