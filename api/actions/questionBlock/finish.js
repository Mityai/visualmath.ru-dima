import { ActiveQuestionBlock } from '../../models/activeQuestionBlock'
import { ActiveQuestion } from '../../models/activeQuestion'
import { access } from '../../utils/access'
import { TEACHER } from '../../utils/roleLevels'

import { io } from '../../api'

// let io = require('../../api').io // убирать во время тестов
// todo: сделать так, чтобы можно было не убирать во время тестов

export let errors = {
  activeQuestionBlockIdIsNotDefined: 'activeQuestionBlockId должен быть строкой',
  activeQuestionBlockNotFound: id => `activeQuestionBlock (id: ${id}) не найдено`
}

export let query = async ({body: {activeQuestionBlockId}}, res, user) => {
  console.info('questionBlock/finish')

  if (!activeQuestionBlockId || typeof activeQuestionBlockId !== 'string') {
    return Promise.reject(errors.activeQuestionBlockIdIsNotDefined)
  }

  let activeQuestionBlock = await ActiveQuestionBlock.findOne({_id: activeQuestionBlockId}).exec()
  if (!activeQuestionBlock) {
    return Promise.reject(errors.activeQuestionBlockNotFound(activeQuestionBlockId))
  }

  let activeQuestions = await ActiveQuestion.find({
    _id: {
      $in: activeQuestionBlock.activeQuestions
    }
  }).exec()

  let promises = activeQuestions.map(it => {
    it.ended = true 
    return it.save()
  })
  await Promise.all(promises)

  activeQuestionBlock.ended = true

  let saved = await activeQuestionBlock.save()

  io.emit(`lecture ${activeQuestionBlock.activeLecture.toString()}`, { type: 'FINISH_BLOCK', activeQuestionBlockId }) 

  return saved.populate('activeQuestions').execPopulate()
}

export default access(TEACHER, query)
