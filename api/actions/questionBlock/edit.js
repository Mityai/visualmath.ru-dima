import {QuestionBlock} from '../../models/questionBlock'
import {access} from '../../utils/access'
import {TEACHER} from '../../utils/roleLevels'

function questionBlockSet(questionBlock, prop, value) {
  if (value) {
    console.info(`setting ${prop} = ${value}`)
    questionBlock[prop] = value
  }
}

export let error = {
  notFound: `cannot find the question block`
}

export let query = async ({body: {id, questions, name}}) => {
  console.info('questionBlock/edit')
  console.info(`id (${id})`)
  let questionBlock = await QuestionBlock.findOne({_id: id}).exec()

  if (!questionBlock) {
    console.error('question block not found')
    return Promise.reject(error.notFound)
  }

  questionBlockSet(questionBlock, 'name', name)
  questionBlockSet(questionBlock, 'questionsIds', questions)

  console.info('updating questionBlock')
  return await questionBlock.save()
}

export default access(TEACHER, query)
