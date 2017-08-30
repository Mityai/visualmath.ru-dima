import {QuestionBlock} from '../../models/questionBlock'
import {Question} from '../../models/question'
import {access} from '../../utils/access'
import {TEACHER} from '../../utils/roleLevels'

export let errors = {
  questionsIdsNotDefined: 'questionsIds должен быть массивом',
  questionsIdsIsEmpty: 'questionsIds должен быть не пустым',
  questionDoesNotExist: id => 'Вопрос (id: ' + id + ') не существует'
}

export let query = async({body: {questionsIds, name}}, res, user) => {
  console.info('questionBlock/add')
  if (!Array.isArray(questionsIds)) {
    console.error(errors.questionsIdsNotDefined)
    return Promise.reject(errors.questionsIdsNotDefined)
  }

  if (questionsIds.length === 0) {
    console.error(errors.questionsIdsIsEmpty)
    return Promise.reject(errors.questionsIdsIsEmpty)
  } 

  console.info(`name: ${name}`)
  console.info(questionsIds)

  try {
    await Promise.all(questionsIds.map(_id => Question.findOne({_id})))
  } catch (error) {
    console.error(error)
    return Promise.reject(error)
  }

  return await new QuestionBlock({
    questionsIds,
    name,
    author: user._id
  }).save()
}

export default access(
  TEACHER,
  query
)
