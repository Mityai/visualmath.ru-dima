import {Question} from '../../models/question'
import {access} from '../../utils/access'
import {TEACHER} from '../../utils/roleLevels'

function questionSet(question, prop, value) {
  if (value) {
    console.info(`setting ${prop} = ${value}`)
    question[prop] = value
  }
}

export let error = {
  notFound: `cannot find the question`
}

export let query = async ({body: {id, question, answers,
  correctAnswers, multiple}}) => {
  console.info('questions/edit')
  console.info(`id (${id})`)
  let ques = await Question.findOne({_id: id}).exec()

  if (!ques) {
    console.error('question not found')
    return Promise.reject(error.notFound)
  }

  questionSet(ques, 'question', question)
  questionSet(ques, 'answers', answers)
  questionSet(ques, 'correctAnswers', correctAnswers)
  questionSet(ques, 'multiple', multiple)

  console.info('updating question')
  return await ques.save()
}

export default access(TEACHER, query)
