import { ActiveQuestionBlock } from '../../models/activeQuestionBlock'
// import { ActiveLecture } from '../../models/activeLecture'
// import { QuestionBlock } from '../../models/questionBlock'

import { access } from '../../utils/access'
import { STUDENT } from '../../utils/roleLevels'

export let errors = {
  // notFound: id => `activeQuestionBlock (id: ${id}) не найден`,
  activeQuestionBlockIdIsNotDefined: 'activeQuestionBlockId должен быть строкой'
}

export let query = async ({ body: { activeQuestionBlockId } }) => {
  console.info('activeQuestionBlock/loadById')
  console.info(`activeQuestionBlockId: ${activeQuestionBlockId}`)

  if (typeof activeQuestionBlockId !== 'string') {
    return Promise.reject(errors.activeQuestionBlockIdIsNotDefined)
  }

  return ActiveQuestionBlock.findOne({
    _id: activeQuestionBlockId
  })
    .populate('activeQuestions')
    .exec()
}

export default access(STUDENT, query)
