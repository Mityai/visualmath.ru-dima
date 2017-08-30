import createReducer from './lib/createReducer'
import immutable from 'immutable'
import { createSelector } from 'reselect'

import {
  CREATE_SLIDE,
  SET_SLIDE_TYPE,
  SET_STATE,
  SET_LECTURE_NAME,
  REMOVE_SLIDE,
  TOGGLE_EXPANDED,
  SET_SLIDE_TEXT,
  SET_SLIDE_NAME,
  SET_SLIDE_IMAGES,
  SET_ANSWER,
  MAKE_ANSWER_SYMBOLIC,
  CHECK_CORRECT_ANSWER,
  CHECK_MULTIPLE_CHOICE,
  RECOMPUTE_SLIDE_MULTIPLE_CHOICE,
  SET_QUESTION_NAME_IN_BLOCK,
  RECOMPUTE_QUESTIONS_IN_BLOCKS,
  DELETE_QUESTION_IN_BLOCK,

  SAVE, 
  SAVE_SUCCESS, 
  SAVE_FAIL, 
  CHECK_SAVE, 
} from '../../actions/lectureConstructor'

export const initialState = immutable.fromJS({
  lectureName: '',
  slides: [],
  __questions: [],
  __state__: {
    checkSaveFail: false,
    justSaved: false,
    savingFail: false,
  }
})

export function findInList(list, id) {
  let item = list.find(it => it.get('_id') === id)
  let index = list.indexOf(item)
  
  if (!item) {
    return null
  }

  return [item, index]
}

export function findSlide(state, slideId) {
  let slides = state.get('slides')
  return findInList(slides, slideId)
}

export function findQuestion(state, questionId) {
  let questions = state.get('__questions')
  return findInList(questions, questionId)
}

export function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return '__' + s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

export function getNewQuestion(_state) {
  let state = _state

  let newQuestion = {
    correctAnswers: [],
    answers: [''],
    __userEnabledMultipleChoice: false,
    multiple: false,
    _id: guid(),
    isAnswerSymbolic: false,
  }

  let __questions = state.get('__questions')
  __questions = __questions.push(immutable.fromJS(newQuestion))
  state = state.set('__questions', __questions)

  return [state, newQuestion]
}

export function isQuestionEmpty(question, ignoreName = false) {
  if (!question) return false
  let isEmpty = question.get('correctAnswers').size === 0
  isEmpty = isEmpty && question.get('answers').size === 1
  if (!ignoreName) {
    isEmpty = isEmpty && !question.get('name')
  }
  return isEmpty
}

export function isQuestionDone(question, ignoreName = false) {
  let isDone = question.get('correctAnswers').size > 0 || question.get('isAnswerSymbolic')
  isDone = isDone && question.get('answers').size > 1
  if (!ignoreName) {
    isDone = isDone && !!question.get('name')
  }
  return isDone
}

export const handlers = {
  [CREATE_SLIDE](_state, { _id, slideType }) {
    let state = _state
    let list = state.get('slides')

    let newSlide = {
      _id,
      type: slideType,
      name: '',
      content: {
        questionIds: [],
        questionId: null,
        text: '',
        images: [],
        imagesLeft: [],
        imagesTop: [],
        imagesScale: [],
      },
      __state__: {
        expanded: true,
      },
    }

    if (slideType === 'question' || slideType === 'block') {
      let newQuestion
      [state, newQuestion] = getNewQuestion(state)

      if (slideType === 'question') {
        newSlide.content.questionId = newQuestion._id
      } else {
        newSlide.content.questionIds = [newQuestion._id]
      }
    }

    list = list.push(immutable.fromJS(newSlide))

    state = state.set('slides', list)
    return state
  },

  [SET_SLIDE_TYPE](_state, { slideId, slideType }) {
    let state = _state

    let [slide, index] = findSlide(state, slideId)
    if (!slide) {
      console.error(`Слайд id: ${slideId} не найден`)
      return _state
    }

    let needToCreateQuestion = (slide.get('type') === 'text' || slide.get('type') === 'block')
      && slideType === 'question'
      && !slide.getIn(['content', 'questionId'])

    if (needToCreateQuestion) {
      let newQuestion
      [state, newQuestion] = getNewQuestion(state)

      slide = slide.setIn(['content', 'questionId'], newQuestion._id)
      state = state.setIn(['slides', index], slide)
    }


    let needToCreateQuestionForBlock = (slide.get('type') === 'text' || slide.get('type') === 'question')
      && slideType === 'block'
      && slide.getIn(['content', 'questionIds']).size === 0

    if (needToCreateQuestionForBlock) {
      let newQuestion
      [state, newQuestion] = getNewQuestion(state)
      slide = slide.setIn(['content', 'questionIds'], immutable.fromJS([newQuestion._id]))
      state = state.setIn(['slides', index], slide)
    }

    state = state.setIn(['slides', index, 'type'], slideType)

    return state
  },

  [SET_LECTURE_NAME](_state, { lectureName }) {
    return _state.set('lectureName', lectureName)
  },
  
  [REMOVE_SLIDE](_state, { slideId }) {
    let state = _state

    let [slide, slideIndex] = findSlide(state, slideId)
    if (!slide) {
      console.error(`Слайд id: ${slideId} не найден`)
      return _state
    }

    state = state.deleteIn(['slides', slideIndex])

    let questionId = slide.getIn(['content', 'questionId'])
    if (questionId) {
      let found = findQuestion(state, questionId)
      let questionIndex = found[1]
      state = state.deleteIn(['__questions', questionIndex])
    }

    let questionIds = slide.getIn(['content', 'questionIds'])
    if (questionIds.size > 0) {
      questionIds.forEach((questionId) => {
        let found = findQuestion(state, questionId)
        let questionIndex = found[1]
        state = state.deleteIn(['__questions', questionIndex])
      })
    }

    return state
  },

  [TOGGLE_EXPANDED](_state, { slideId }) {
    let state = _state
    
    let [slide, index] = findSlide(_state, slideId)
    if (!slide) {
      console.error(`Слайд id: ${slideId} не найден`)
      return _state
    }

    let isExpanded = slide.getIn(['__state__', 'expanded'])
    state = state.setIn(['slides', index, '__state__', 'expanded'], !isExpanded)

    return state
  },

  [SET_SLIDE_TEXT](_state, { slideId, text }) {
    let state = _state

    let [slide, index] = findSlide(state, slideId)
    if (!slide) {
      console.error(`Слайд id: ${slideId} не найден`)
      return _state
    }
    if (slide.get('type') !== 'text') {
      return _state
    }

    slide = slide.setIn(['content', 'text'], text)

    state = state.setIn(['slides', index], slide)

    return state
  },

  [SET_SLIDE_NAME](_state, { slideId, name }) {
    let state = _state

    let [slide, index] = findSlide(state, slideId)
    if (!slide) {
      console.error(`Слайд id: ${slideId} не найден`)
      return _state
    }

    slide = slide.set('name', name)

    state = state.setIn(['slides', index], slide)

    return state
  },

  [SET_SLIDE_IMAGES](_state, { slideId, images }) {
    let state = _state

    let [slide, index] = findSlide(state, slideId)
    if (!slide) {
      console.error(`Слайд id: ${slideId} не найден`)
      return _state
    }

    slide = slide.setIn(['content', 'images'], images._images)
                 .setIn(['content', 'imagesLeft'], images._imagesLeft)
                 .setIn(['content', 'imagesTop'], images._imagesTop)
                 .setIn(['content', 'imagesScale'], images._imagesScale)

    state = state.setIn(['slides', index], slide)

    return state
  },

  [SET_ANSWER](_state, { questionId, answerId, value }) {
    let state = _state

    let [question, questionIndex] = findQuestion(state, questionId)

    question = question.setIn(['answers', answerId], value)

    let answers = question.get('answers')
    if (answers.size - 1 === answerId) {
      answers = answers.push('')
      question = question.set('answers', answers)
    }

    if (value === '') {
      let correctAnswers = question.get('correctAnswers')
      let index = correctAnswers.indexOf(answerId)
      if (index > -1) {
        correctAnswers = correctAnswers.delete(index)
        question = question.set('correctAnswers', correctAnswers)
      }
    }

    if (answerId === answers.size - 2 && value === '' && answers.last() === '') {
      let correctAnswers = question.get('correctAnswers')
      let index = correctAnswers.indexOf(answers.size - 1)
      if (index > -1) {
        correctAnswers = correctAnswers.delete(index)
      }

      answers = answers.pop()
      question = question.set('correctAnswers', correctAnswers)
      question = question.set('answers', answers)
    }

    state = state.setIn(['__questions', questionIndex], question)

    return state
  },

  [MAKE_ANSWER_SYMBOLIC](_state, { questionId, checked }) {
    let state = _state

    let [question, questionIndex] = findQuestion(state, questionId)
    question = question.set('isAnswerSymbolic', checked)
    state = state.setIn(['__questions', questionIndex], question)

    return state
  },

  [CHECK_CORRECT_ANSWER](_state, { questionId, answerId, checked }) {
    let state = _state

    let [question, questionIndex] = findQuestion(state, questionId)

    let correctAnswers = question.get('correctAnswers')
    if (checked && !correctAnswers.contains(answerId)) {
      correctAnswers = correctAnswers.push(answerId)
    } else if (!checked && correctAnswers.contains(answerId)) {
      let index = correctAnswers.indexOf(answerId)
      correctAnswers = correctAnswers.delete(index)
    }

    question = question.set('correctAnswers', correctAnswers)
    state = state.setIn(['__questions', questionIndex], question)

    return state
  },

  [CHECK_MULTIPLE_CHOICE](_state, { questionId, checked }) {
    let state = _state

    let [question, questionIndex] = findQuestion(state, questionId)

    question = question.set('__userEnabledMultipleChoice', checked)
    state = state.setIn(['__questions', questionIndex], question)

    return state
  },

  [RECOMPUTE_SLIDE_MULTIPLE_CHOICE](_state, { questionId }) {
    let state = _state

    let [question, questionIndex] = findQuestion(state, questionId)

    let __userEnabledMultipleChoice = question.get('__userEnabledMultipleChoice')
    let correctAnswers = question.get('correctAnswers')

    let multiple = __userEnabledMultipleChoice || correctAnswers.size > 1
    question = question.set('multiple', multiple)
    state = state.setIn(['__questions', questionIndex], question)

    return state
  },

  [SET_QUESTION_NAME_IN_BLOCK](_state, { questionId, name }) {
    let state = _state

    let [question, index] = findQuestion(state, questionId)
    question = question.set('name', name)
    state = state.setIn(['__questions', index], question)

    return state
  },

  [RECOMPUTE_QUESTIONS_IN_BLOCKS](_state) {
    let state = _state

    let blocksWithIndexes = state.get('slides')
      .map((slide, index) => {
        let blockWithIndex = immutable.fromJS({ index })
        blockWithIndex = blockWithIndex.set('block', slide)
        return blockWithIndex
      })
      .filter(it => it.getIn(['block', 'type']) === 'block')

    function recompute(blockWithIndex) {
      let block = blockWithIndex.get('block')

      let questions = block.getIn(['content', 'questionIds']).map((id) => {
        let [q] = findQuestion(state, id)
        return q
      })

      let lastQuestion = questions.last()
      let penultimateQuestion = questions.get(questions.size - 2)
      if (isQuestionEmpty(lastQuestion) && isQuestionEmpty(penultimateQuestion)) {
        let data = findQuestion(state, lastQuestion.get('_id'))
        let questionIndex = data[1]
        state = state.deleteIn(['__questions', questionIndex])
        
        let indexOflastQuestion = questions.size - 1
        questions = questions.delete(indexOflastQuestion)
        block = block.deleteIn(['content', 'questionIds', indexOflastQuestion])
      }

      if (isQuestionDone(lastQuestion)) {
        let newQuestion
        [state, newQuestion] = getNewQuestion(state)
        let questionIds = block.getIn(['content', 'questionIds'])
        questionIds = questionIds.push(newQuestion._id)
        block = block.setIn(['content', 'questionIds'], questionIds)
      }

      return blockWithIndex.set('block', block)
    } 

    blocksWithIndexes = blocksWithIndexes.map(blockWithIndex => recompute(blockWithIndex))
    
    blocksWithIndexes.forEach((blockWithIndex) => {
      let index = blockWithIndex.get('index')
      let block = blockWithIndex.get('block')
      state = state.setIn(['slides', index], block)
    })

    return state
  },

  [DELETE_QUESTION_IN_BLOCK](_state, { questionId, slideId }) {
    let state = _state

    let [slide, slideIndex] = findSlide(state, slideId)
    let questionData = findQuestion(state, questionId)
    let questionIndex = questionData[1]

    let questionIds = slide.getIn(['content', 'questionIds'])
    let questionIndexInSlide = questionIds.indexOf(questionId)
    questionIds = questionIds.delete(questionIndexInSlide)
    slide = slide.setIn(['content', 'questionIds'], questionIds)
    state = state.setIn(['slides', slideIndex], slide)

    state = state.deleteIn(['__questions', questionIndex])

    return state
  },

  [SET_STATE](_state, { state }) {
    let newState = state

    newState = newState.set('__state__', initialState.get('__state__'))

    return newState
  }, 
 
  [CHECK_SAVE](_state, { isFail }) { 
    let state = _state 
 
    state = state.setIn(['__state__', 'checkSaveFail'], isFail)
 
    return state 
  },

  [SAVE_SUCCESS](_state) {
    let state = _state.set('__state__', initialState.get('__state__'))
    return state.setIn(['__state__', 'justSaved'], true)
  },

  [SAVE_FAIL](_state) {
    let state = _state.set('__state__', initialState.get('__state__'))
    return state.setIn(['__state__', 'savingFail'], true)
  }
}

export default createReducer(initialState, handlers)


// selectors

export function getLectureConstructor(state) {
  return state.lectureConstructor
}

export const getSlides = createSelector(
  getLectureConstructor,
  (lc) => {
    let slides = lc.get('slides')

    slides = slides.map((_slide) => {
      let slide = _slide

      if (slide.get('type') === 'question') {
        let questions = lc.get('__questions')
        let content = slide.get('content')
        let [question] = findInList(questions, content.get('questionId'))
        content = content.merge(question)
        slide = slide.set('content', content)
      } else if (slide.get('type') === 'block') {
        let questions = lc.get('__questions')
        let content = slide.get('content')
        let blockQuestions = content.get('questionIds').map((questionId) => {
          let [q] = findInList(questions, questionId)
          return q
        })
        content = content.set('questions', blockQuestions)
        slide = slide.set('content', content)
      }

      return slide
    })

    return slides
  }
)

export const getLastNumericId = createSelector(
  getSlides,
  (slides) => {
    let ids = slides.map(it => it.get('_id'))
    let lastNumericId = null
    ids.filter(id => typeof id === 'number')
      .forEach(id => lastNumericId = id)
    
    return lastNumericId
  }
)

export const getLectureName = createSelector(
  getLectureConstructor,
  lc => lc.get('lectureName')
)

export const isCheckFail = createSelector(
  getLectureConstructor,
  lc => lc.getIn(['__state__', 'checkSaveFail'])
)

export const isSaveFail = createSelector(
  getLectureConstructor,
  lc => lc.getIn(['__state__', 'savingFail'])
)

export const isSaveOk = createSelector(
  getLectureConstructor,
  lc => lc.getIn(['__state__', 'justSaved'])
)

// actions

export const LECTURE_CONSTRUCTOR_DRAFT = 'LECTURE_CONSTRUCTOR_DRAFT'

export function saveToLocalStorage() {
  return (dispatch, getState) => {
    let state = getLectureConstructor(getState())
    window.localStorage.setItem(LECTURE_CONSTRUCTOR_DRAFT, JSON.stringify(state.toJS()))
  }
}

export function loadFromLocalStorage() {
  return (dispatch) => {
    let state = JSON.parse(window.localStorage.getItem(LECTURE_CONSTRUCTOR_DRAFT))
    if (!state) {
      return
    }

    state = immutable.fromJS(state)

    dispatch({
      state,
      type: SET_STATE,
    })
  }
}

export function resetState() {
  return (dispatch) => {
    dispatch({
      state: initialState,
      type: SET_STATE,
    })
  }
}

/**
 * @param {number | string} slideId
 * @param {'text' | 'visual' | 'question' | 'block'}
 */
export function setSlideType(slideId, slideType) {
  return {
    slideId,
    slideType,
    type: SET_SLIDE_TYPE,
  }
}

/**
 * @param {'text' | 'visual' | 'question' | 'block'}
 */
export function createSlide(slideType) {
  return (dispatch, getState) => {
    let state = getState()

    let lastNumericId = getLastNumericId(state)
    let _id = lastNumericId === null ? 1 : lastNumericId + 1

    dispatch({
      _id,
      slideType,
      type: CREATE_SLIDE,
    })
  }
}

export function toggleExpanded(slideId) {
  return {
    slideId,
    type: TOGGLE_EXPANDED,
  }
}

export function setLectureName(lectureName) {
  return {
    lectureName,
    type: SET_LECTURE_NAME,
  }
}

export function removeSlide(slideId) {
  return {
    slideId,
    type: REMOVE_SLIDE,
  }
}

export function setSlideText(slideId, text) {
  return {
    text,
    slideId,
    type: SET_SLIDE_TEXT,
  }
}

export function setSlideName(slideId, name) {
  return {
    name,
    slideId,
    type: SET_SLIDE_NAME,
  }
}

export function setSlideImages(slideId, images) {
  return {
    images,
    slideId,
    type: SET_SLIDE_IMAGES,
  }
}

export function setAnswer(questionId, answerId, value) {
  return {
    questionId,
    answerId,
    value,
    type: SET_ANSWER,
  }
}

export function makeAnswerSymbolic(questionId, checked) {
  return {
    questionId,
    checked,
    type: MAKE_ANSWER_SYMBOLIC,
  }
}

export function checkCorrectAnswer(questionId, answerId, checked) {
  return (dispatch) => {
    dispatch({
      questionId,
      answerId,
      checked,
      type: CHECK_CORRECT_ANSWER,
    })

    dispatch({
      questionId,
      type: RECOMPUTE_SLIDE_MULTIPLE_CHOICE,
    })
  }
}

export function checkMultipleChoice(questionId, checked) {
  return (dispatch) => {
    dispatch({
      questionId,
      checked,
      type: CHECK_MULTIPLE_CHOICE,
    })

    dispatch({
      questionId,
      type: RECOMPUTE_SLIDE_MULTIPLE_CHOICE,
    })
  }
}

export function setAnswerInBlock(questionId, answerId, value) {
  return (dispatch) => {
    dispatch({
      questionId,
      answerId,
      value,
      type: SET_ANSWER,
    })

    dispatch({
      type: RECOMPUTE_QUESTIONS_IN_BLOCKS,
    })
  }
}

export function checkCorrectAnswerInBlock(questionId, answerId, checked) {
  return (dispatch) => {
    dispatch({
      questionId,
      answerId,
      checked,
      type: CHECK_CORRECT_ANSWER,
    })

    dispatch({
      questionId,
      type: RECOMPUTE_SLIDE_MULTIPLE_CHOICE,
    })

    dispatch({
      type: RECOMPUTE_QUESTIONS_IN_BLOCKS,
    })
  }
}

export function checkMultipleChoiceInBlock(questionId, checked) {
  return (dispatch) => {
    dispatch({
      questionId,
      checked,
      type: CHECK_MULTIPLE_CHOICE,
    })

    dispatch({
      questionId,
      type: RECOMPUTE_SLIDE_MULTIPLE_CHOICE,
    })
  }
}

export function setQuestionNameInBlock(questionId, name) {
  return (dispatch) => {
    dispatch({
      name,
      questionId,
      type: SET_QUESTION_NAME_IN_BLOCK,
    })

    dispatch({
      type: RECOMPUTE_QUESTIONS_IN_BLOCKS,
    })
  }
}

export function deleteQuestionInBlock(slideId, questionId) {
  return {
    slideId,
    questionId,
    type: DELETE_QUESTION_IN_BLOCK,
  }
}

export function saveLecture() {
  function checkBlock(slide, state) {
    let isBlockOk = !!slide.get('name')

    let questions = slide.getIn(['content', 'questionIds'])
      .map((questionId) => {
        let [q] = findQuestion(state, questionId)
        return q
      })
  
    let allQuestionsOk = questions.reduce((isOk, question, index) => {
      if (index === questions.size - 1) {
        return isOk && isQuestionEmpty(question, true) && !question.get('name')
      }

      return isOk && isQuestionDone(question, true) && !!question.get('name')
    }, true)

    isBlockOk = isBlockOk && allQuestionsOk && questions.size > 1

    return isBlockOk
  } 

  function checkQuestion(slide, state) {
    let questionId = slide.getIn(['content', 'questionId'])
    let isQuestionOk = !!slide.get('name') && !!questionId
    if (!isQuestionOk) {
      return false
    }

    let [question] = findQuestion(state, questionId)
    isQuestionOk = isQuestionOk && isQuestionDone(question, true)

    return isQuestionOk
  }

  function checkText(slide) {
    return !!slide.getIn(['content', 'text']) && !!slide.get('name')
  }
  
  function checkSlide(slide, state) {
    let slideType = slide.get('type')

    if (slideType === 'text') {
      return checkText(slide)
    } else if (slideType === 'question') {
      return checkQuestion(slide, state)
    } else if (slideType === 'block') {
      return checkBlock(slide, state)
    }
  }

  function prepareQuestion(_question) {
    let question = _question
    let keys = question.keySeq().toArray()

    keys.filter(key => key.slice(0, 2) === '__')
      .forEach(key => question = question.delete(key))

    let answers = question.get('answers')
    question = question.deleteIn(['answers', answers.size - 1])

    return question
  }

  function prepareSlideContentKeys(_slide, contentKeys) {
    let slide = _slide

    slide = slide.delete('__state__')

    slide.get('content').keySeq().toArray()
      .forEach((key) => {
        if (contentKeys.indexOf(key) !== -1) return

        slide = slide.deleteIn(['content', key])
      })

    return slide
  }

  function prepareBlock(_block, _state) {
    let block = _block
    let state = _state

    let questionIds = block.getIn(['content', 'questionIds'])
    let lastQuestionId = questionIds.last()
    block = block.deleteIn(['content', 'questionIds', questionIds.size - 1])

    let data = findQuestion(state, lastQuestionId)
    let questionIndex = data[1]
    state = state.deleteIn(['__questions', questionIndex])

    return [block, state]
  }

  function prepareSlide(slide, state) {
    let slideType = slide.get('type')

    if (slideType === 'text') {
      return [prepareSlideContentKeys(slide, ['text', 'images', 'imagesLeft', 'imagesTop', 'imagesScale']), state]
    } else if (slideType === 'question') {
      return [prepareSlideContentKeys(slide, ['questionId', 'images', 'imagesLeft', 'imagesTop', 'imagesScale']), state]
    } else if (slideType === 'block') {
      let block = prepareSlideContentKeys(slide, ['questionIds'])
      return prepareBlock(block, state)
    }
  }

  function prepareToSave(_state) {    
    let state = _state

    let __questions = state.get('__questions')
    __questions = __questions.map(prepareQuestion)

    state = state.set('__questions', __questions)

    let slides = state.get('slides')
    slides = slides.map((_slide) => {
      let slide
      [slide, state] = prepareSlide(_slide, state)
      return slide
    })
    state = state.set('slides', slides)

    return state
  }

  return (dispatch, getState) => {
    let state = getLectureConstructor(getState())

    let isLectureOk = true

    state.get('slides').forEach(slide => isLectureOk = isLectureOk && checkSlide(slide, state))

    isLectureOk = isLectureOk && !!state.get('lectureName')

    if (!isLectureOk) { 
      dispatch({ 
        type: CHECK_SAVE,
        isFail: true,
      }) 
      return 
    } 

    dispatch({
      type: CHECK_SAVE,
      isFail: false,
    })
 
    state = prepareToSave(state) 
    // console.log('saving state', state.toJS()) 
     
    dispatch({ 
      types: [SAVE, SAVE_SUCCESS, SAVE_FAIL], 
      promise: client => client.post('/lecture_constructor/create', { 
        data: { 
          constructed: state.toJS(), 
        } 
      }) 
    })
  }
}
