import {QuestionBlock} from '../../models/questionBlock'
import {access} from '../../utils/access'
import {STUDENT} from '../../utils/roleLevels'

export let errors = {}

export let query = async () => {
  return QuestionBlock.find({}).exec()
}

export default access(
  STUDENT,
  query
)
