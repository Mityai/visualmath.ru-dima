import { ActiveQuestionBlock } from '../../models/activeQuestionBlock'
import { QuestionBlock } from '../../models/questionBlock'
import { ActiveLecture } from '../../models/activeLecture'
import { ActiveQuestion } from '../../models/activeQuestion'
import { access } from '../../utils/access'
import { TEACHER } from '../../utils/roleLevels'

export let errors = {
  activeLectureIdIsNotDefined: 'activeLectureId должен быть строкой',
  questionBlockIdIsNotDefined: 'questionBlockId должен быть строкой',
  activeLectureNotFound: id => `activeLecture (id: ${id}) не найдено`,
  questionBlockNotFound: id => `questionBlock (id: ${id}) не найдено`
}

export let query = async ({body: {activeLectureId, questionBlockId}}, res, user) => {
  console.info('questionBlock/start')

  if (!activeLectureId || typeof activeLectureId !== 'string') {
    return Promise.reject(errors.activeLectureIdIsNotDefined)
  }

  if (!questionBlockId || typeof questionBlockId !== 'string') {
    return Promise.reject(errors.questionBlockIdIsNotDefined)
  }

  let activeLecture = await ActiveLecture.findOne({_id: activeLectureId}).exec()
  if (!activeLecture) {
    return Promise.reject(errors.activeLectureNotFound(activeLectureId))
  }

  let questionBlock = await QuestionBlock.findOne({_id: questionBlockId}).exec()
  if (!questionBlock) {
    return Promise.reject(errors.questionBlockNotFound(questionBlockId))
  }

  let activeQuestionBlock = await ActiveQuestionBlock.findOne({
    activeLecture: activeLectureId,
    questionBlock: questionBlockId
  }).exec()


  // todo: покрыть тестами
  if (!activeQuestionBlock) {
    let promises = questionBlock.questionsIds.map(questionId => new ActiveQuestion({
      creator: user._id,
      activeLecture: activeLectureId,
      question: questionId
    }).save())

    let activeQuestions = await Promise.all(promises)

    activeQuestionBlock = new ActiveQuestionBlock({
      speaker: user._id,
      activeLecture: activeLectureId,
      questionBlock: questionBlockId,
      activeQuestions: activeQuestions.map(it => it.id)
    })

    activeQuestionBlock = await activeQuestionBlock.save()

    // todo: добавлять к activeLecture запись о том, что к ней добавлен
    // activeQuestionBlock  

    // покрыть тестами
    activeLecture.activeQuestionBlocks.push(activeQuestionBlock._id)
    await activeLecture.save()
  }

  return activeQuestionBlock
    .populate('activeQuestions')
    .execPopulate()
}

export default access(TEACHER, query)
