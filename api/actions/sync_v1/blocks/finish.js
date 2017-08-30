import { access } from '../../../utils/access'
import { TEACHER } from '../../../utils/roleLevels'
import { ActiveLecture } from '../../../models/activeLecture'
import { ActiveQuestion } from '../../../models/activeQuestion'
import { ActiveQuestionBlock } from '../../../models/activeQuestionBlock'
import { QuestionBlock } from '../../../models/questionBlock'
import { io } from '../../../api'

export let errors = {
  noLectureId: 'id лекции не отправлен',
  noBlockId: 'id блока не отправлен',
  lectureNotFound: id => `activeLecture id: (${id}) не найдена`,
  blockNotFound: id => `questionBlock id: (${id}) не найден`,
  notEnoughRights: 'Недостаточно прав для совершения действия',
}


export let query = async ({ body: { activeLectureId, blockId } }, res, user) => {
  if (!activeLectureId) {
    return Promise.reject(errors.noLectureId)
  }

  if(!blockId) {
    return Promise.reject(errors.noBlockId)
  }

  let activeLecture = await ActiveLecture.findOne({ _id: activeLectureId }).exec()
  if (!activeLecture) {
    return Promise.reject(errors.lectureNotFound(activeLectureId))
  }

  if (activeLecture.speaker.toString() !== user._id) {
    return Promise.reject(errors.notEnoughRights)
  }

  let activeBlock = await ActiveQuestionBlock.findOne({
      questionBlock: blockId,
      activeLecture: activeLectureId,
      speaker: user._id,
      ended: false,
    })
    .populate({
      path: 'activeQuestions', 
      populate: {
        path: 'question',
      },
    })
    .exec()

  if (!activeBlock) {
    return Promise.reject(errors.blockNotFound(blockId))
  }

  activeBlock.ended = true
  activeBlock.finishedAt = Date.now()
  activeBlock = await activeBlock.save()
  
  let finishQuestionsPromises = []
  for (let activeQuestion of activeBlock.activeQuestions) {
    activeQuestion.ended = true
    finishQuestionsPromises.push(activeQuestion.save())
  }
  await Promise.all(finishQuestionsPromises)

  io.emit(`sync_v1/blocks:${activeLectureId}:${blockId}`, {
    type: 'BLOCK_FINISH',
    activeBlock,
    activeLectureId,
    blockId,
  })

  return activeBlock
}

export default access(TEACHER, query)
