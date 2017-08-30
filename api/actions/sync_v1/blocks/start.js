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

  let block = await QuestionBlock.findOne({ _id: blockId })
    .populate('questionsIds')
    .exec()

  if (!block) {
    return Promise.reject(errors.blockNotFound(blockId))
  }

  let promises = block.questionsIds.map(({_id}) => {
    let activeQuestionInfo = { 
      question: _id,
      activeLecture: activeLectureId,
      creator: user._id,
      block: true,
    }
    let activeQuestion = new ActiveQuestion(activeQuestionInfo)
    return activeQuestion.save()
  })

  let activeQuestions = await Promise.all(promises)

  let activeQuestionBlockInfo = {
    speaker: user._id,
    activeLecture: activeLectureId,
    questionBlock: blockId,
    activeQuestions: activeQuestions.map(it => it._id),
    startedAt: Date.now(),
  }

  let activeQuestionBlock = new ActiveQuestionBlock(activeQuestionBlockInfo)
  activeQuestionBlock = await activeQuestionBlock.save()

  activeQuestionBlock = Object.assign({ currentQuestion: 0 }, { 
    speaker: activeQuestionBlock.speaker,
    activeLecture: activeQuestionBlock.activeLecture,
    questionBlock: activeQuestionBlock.questionBlock,
    activeQuestions: activeQuestionBlock.activeQuestions,
    ended: activeQuestionBlock.ended,
    finishedAt: activeQuestionBlock.finishedAt,
  })

  io.emit(`sync_v1/blocks:${activeLectureId}:${blockId}`, {
    type: 'BLOCK_START',
    activeQuestionBlock,
    activeLectureId,
    blockId,
  })

  return activeQuestionBlock
}

export default access(TEACHER, query)
