import { access } from '../../../utils/access'
import { ActiveLecture } from '../../../models/activeLecture'
import { Lecture } from '../../../models/lecture'
import { Module } from '../../../models/module'
import { Question } from '../../../models/question'
import { ActiveQuestion } from '../../../models/activeQuestion'
import { QuestionBlock } from '../../../models/questionBlock'
import { ActiveQuestionBlock } from '../../../models/activeQuestionBlock'
import { STUDENT } from '../../../utils/roleLevels'
import { io } from '../../../api'

export function getMapIndex(unit, lecture) {
  let map = lecture.mapping[unit.index] 
  return map.index
}

export async function loadModule(unit, lecture) {
  let mapppedIndex = getMapIndex(unit, lecture)
  let _id = lecture.modules[mapppedIndex]
  unit.content = await Module.findOne({ _id })

  unit.type = 'slide'
}

export async function loadQuestion({ unit, lecture, activeLectureId }) {
  let mapppedIndex = getMapIndex(unit, lecture)
  let _id = lecture.questions[mapppedIndex]
  let question = await Question.findOne({ _id })
  unit.content = question

  let activeQuestion = await ActiveQuestion.findOne({
    activeLecture: activeLectureId,
    question: _id,
    ended: false,
    block: false,
  }, 'creator activeLecture _id question ended')
  .exec()

  if (!activeQuestion) {
    activeQuestion = await ActiveQuestion.findOne({
      activeLecture: activeLectureId,
      question: _id,
      ended: true,
      block: false,
    }, 'creator activeLecture _id question ended')
    .sort('-finishedAt')
    .exec()
  }

  unit.activeContent = activeQuestion
  unit.type = 'question'
}

export async function loadQuestionBlock({ unit, lecture, activeLectureId, userId }) {
  let mapppedIndex = getMapIndex(unit, lecture)
  let _id = lecture.questionBlocks[mapppedIndex]
  unit.content = await QuestionBlock.findOne({ _id })
    .populate('questionsIds')
    .exec()

  unit.type = 'questionBlock'

  let activeBlock = await ActiveQuestionBlock.findOne({
    activeLecture: activeLectureId,
    questionBlock: _id,
    ended: false,
  })
  .populate({
    path: 'activeQuestions',
    select: 'creator activeLecture _id question ended userAnswers',
    populate: {
      path: 'userAnswers',
    }
  })
  .exec()

  if (!activeBlock) {
    activeBlock = await ActiveQuestionBlock.findOne({
      activeLecture: activeLectureId,
      questionBlock: _id,
      ended: true,
    })
    .populate({
      path: 'activeQuestions',
      select: 'creator activeLecture _id question ended userAnswers',
      populate: {
        path: 'userAnswers',
      }
    })
    .sort('-finishedAt')
    .exec()
  }

  unit.activeContent = null

  if (activeBlock) {
    let currentQuestion = 0
    activeBlock.activeQuestions.forEach(({ userAnswers }, index) => {
      let answer = userAnswers.filter(it => it.user.toString() === userId)[0]
      if (answer) {
        currentQuestion = Math.max(currentQuestion, index + 1)
      }
    })
      
    if (currentQuestion >= activeBlock.activeQuestions.length) {
      currentQuestion = 'done'
    }

    unit.activeContent = Object.assign({ currentQuestion }, { 
      speaker: activeBlock.speaker,
      activeLecture: activeBlock.activeLecture,
      questionBlock: activeBlock.questionBlock,
      activeQuestions: activeBlock.activeQuestions,
      ended: activeBlock.ended,
      finishedAt: activeBlock.finishedAt,
    })
  }
}

export let errors = {
  noId: 'id лекции не отправлен',
  notFound: id => `activeLecture id: (${id}) не найдена`,
}

export let query = async ({ body: { activeLectureId } }, res, user) => {
  if (!activeLectureId) {
    return Promise.reject(errors.noId)
  }
  
  let activelecture = await ActiveLecture.findOne({ _id: activeLectureId }).exec()
  if (!activelecture) {
    return Promise.reject(errors.notFound(activeLectureId))
  }

  let slideNumber = activelecture.ongoingModule
  let lecture = await Lecture
    .findOne({ _id: activelecture.lecture }, 'mapping modules questions questionBlocks')
    .exec()
  
  let unit = {
    index: slideNumber,
  }
  let map = lecture.mapping[slideNumber]
  if (map.type === 'module') {
    await loadModule(unit, lecture)

  } else if (map.type === 'question') {
    await loadQuestion({ unit, lecture, activeLectureId, userId: user._id })

  } else if (map.type === 'questionBlock') {
    await loadQuestionBlock({ unit, lecture, activeLectureId, userId: user._id })
  }

  return unit
}

export default access(STUDENT, query)
