import createReducer from './lib/createReducer'
/*
import keyBy from 'lodash/keyBy'
import merge from 'lodash/merge'
*/
import cloneDeep from 'lodash/cloneDeep'
import forEach from 'lodash/forEach'
import flatten from 'lodash/flatten'
import isEqual from 'lodash/isEqual'

import { loadSingle as loadSingleUser } from './users'

import {
  LOAD,
  LOAD_SUCCESS,
  LOAD_FAIL,
  LOCAL_FINISH
} from 'actions/activeQuestionBlocks'

import { LOCAL_FINISH as QUESTION_LOCAL_FINISH } from 'actions/activeQuestions'

import { START_SUCCESS, FINISH_SUCCESS } from 'actions/questionBlocks'

import { LOGOUT_SUCCESS } from 'actions/auth'

let path = 'activeQuestionBlocks'

let initialState = {
  statuses: {
    loading: false
  },
  list: {}
}

function loadBlock(state, result) {
  let formattedResult = cloneDeep(result)
  formattedResult.activeQuestions = formattedResult.activeQuestions.map(it => it._id)

  return {
    ...state,
    list: {
      ...state.list,
      [formattedResult._id]: formattedResult
    }
  }
}

export let handlers = {
  [START_SUCCESS](state, { result }) {
    return loadBlock(state, result)
  },

  [FINISH_SUCCESS](state, { result }) {
    return loadBlock(state, result)
  },

  [LOAD](state) {
    return {
      ...state,
      statuses: {
        ...state.statuses,
        loading: true
      }
    }
  },

  [LOAD_SUCCESS](state, { result }) {
    return loadBlock(state, result)
  },

  [LOAD_FAIL](state) {
    return {
      ...state,
      statuses: {
        ...state.statuses,
        loading: false
      }
    }
  },

  [LOCAL_FINISH](state, { activeQuestionBlockId }) {
    let block = cloneDeep(state.list[activeQuestionBlockId])
    if (!block) {
      return state
    }
    block.ended = true
    return {
      ...state,
      list: {
        ...state.list,
        [activeQuestionBlockId]: block
      }
    }
  },

  [LOGOUT_SUCCESS]() {
    return initialState
  }
}

export default createReducer(initialState, handlers)


// actions
export function load(activeLectureId, questionBlockId) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: client => client.post('/activeQuestionBlock/load', {
      data: {
        activeLectureId,
        questionBlockId
      }
    })
  }
}

export function loadById(activeQuestionBlockId) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: client => client.post('/activeQuestionBlock/loadById', {
      data: {
        activeQuestionBlockId
      }
    })
  }
}

// selectors
export function getByActiveLectureIdAndQuestionBlockId(state, activeLectureId, questionBlockId) {
  let list = state[path].list
  
  let activeQuestionBlock = null
  forEach(list, it => {
    if (it.activeLecture === activeLectureId && it.questionBlock === questionBlockId) {
      activeQuestionBlock = cloneDeep(it)
    }
  })

  if (activeQuestionBlock) {
    activeQuestionBlock.activeQuestionObjects = activeQuestionBlock.activeQuestions
      .map(activeQuestionId => state.activeQuestions.list[activeQuestionId])

    let areThereUndefined = false

    activeQuestionBlock.activeQuestionObjects.forEach(it => areThereUndefined = areThereUndefined || !it)

    if (areThereUndefined) {
      return null
    }
    
    activeQuestionBlock.questionToActiveQuestionMapping = {}
    let mapping = activeQuestionBlock.questionToActiveQuestionMapping // just alias for readability
    activeQuestionBlock.activeQuestionObjects.forEach(activeQuestion => {
      mapping[activeQuestion.question] = activeQuestion
    })
  }

  return activeQuestionBlock
}

export function getActiveQuestions(state, activeQuestionBlockId) {
  let activeQuestionBlock = state.activeQuestionBlocks.list[activeQuestionBlockId]
  if (!activeQuestionBlock) {
    return null
  }
  
  let activeQuestions = activeQuestionBlock.activeQuestions
    .map(id => state.activeQuestions.list[id]) // copying
  
  return activeQuestions
}

/* export function getUserIds(state, activeQuestionBlockId) {
  let activeQuestions = getActiveQuestions(state, activeQuestionBlockId)
  if (!activeQuestions) {
    return null
  }

  let userIds = []
  activeQuestions.forEach((aq) => {
    aq.userAnswers.forEach(({ user }) => {
      if (userIds.indexOf(user) === -1) userIds.push(user)
    })
  })

  return userIds
}*/

export function getRelatedQuestionsIds(state, activeQuestionBlockId) {
  let activeQuestionBlock = state.activeQuestionBlocks.list[activeQuestionBlockId]
  if (!activeQuestionBlock) {
    return null
  }

  let activeQuestionsIds = activeQuestionBlock.activeQuestions
  let areThereUndefined = false
  let activeQuestions = activeQuestionsIds.map(id => {
    let activeQuestion = state.activeQuestions.list[id]
    if (!activeQuestion) {
      areThereUndefined = true
    }
    return activeQuestion
  })

  if (areThereUndefined) {
    return null
  }

  return activeQuestions.map(it => it.question)
}

export function getRelatedQuestions(state, activeQuestionBlockId) {
  let questionsIds = getRelatedQuestionsIds(state, activeQuestionBlockId)

  if (!questionsIds) {
    return null
  }

  let areThereUndefined = false
  let questions = questionsIds.map(id => {
    let question = state.questions.list[id]
    if (!question) {
      areThereUndefined = true
    }
    return question
  })

  if (areThereUndefined) {
    return null
  }

  return questions
}

export function getById(state, activeQuestionBlockId) {
  return cloneDeep(state.activeQuestionBlocks.list[activeQuestionBlockId])
}

export function getRelatedActiveQuestions(state, activeQuestionBlockId) {
  let block = getById(state, activeQuestionBlockId)
  if (!block) {
    return []
  }

  let activeQuestionsIds = block.activeQuestions
  let activeQuestions = activeQuestionsIds.map(id => state.activeQuestions.list[id])
  return activeQuestions
}

export function getUserIds(state, activeQuestionBlockId) {
  let block = getById(state, activeQuestionBlockId)
  if (!block) {
    return []
  }

  let users = {}

  let activeQuestions = getRelatedActiveQuestions(state, activeQuestionBlockId)
  let userAnswers = activeQuestions.map(it => it.userAnswers)
  flatten(userAnswers).forEach(it => {
    users[it.user] = true
  })

  let usersArray = Object.keys(users).map(key => key)
  return usersArray
}

export function getUsers(state, activeQuestionBlockId) {
  let userIds = getUserIds(state, activeQuestionBlockId)
  if (!userIds) {
    return null
  }

  let users = userIds.map(id => state.users.list[id])

  let hasUndefined = users.reduce((has, value) => has || !value, false)
  if (hasUndefined) return null

  return users
}

export function getRelatedUsers(state, activeQuestionBlockId) {
  let usersIds = getUserIds(state, activeQuestionBlockId)
  return cloneDeep(usersIds.map(id => state.users.list[id]))
}

export function getQuestionResults(state, userId, activeQuestionBlockId) {
  let activeQuestions = getRelatedActiveQuestions(state, activeQuestionBlockId)
  let results = {}
  activeQuestions.forEach(activeQuestion => {
    results[activeQuestion.question] = 0
    let answers = activeQuestion.userAnswers
    let answerIndex = answers.map(it => it.user).indexOf(userId)
    if (answerIndex !== -1) {
      let userAnswer = answers[answerIndex].answer.sort((a, b) => a - b) // eslint-disable-line
      let correctAnswers = state.questions.list[activeQuestion.question].correctAnswers.sort((a, b) => a - b) // eslint-disable-line
      if (isEqual(userAnswer, correctAnswers)) {
        results[activeQuestion.question] = 1
      }
    }
  })

  return results
}

export function localFinishBlock(activeQuestionBlockId) {
  return (dispatch, getState) => {
    dispatch({
      type: LOCAL_FINISH,
      activeQuestionBlockId
    })

    let state = getState()
    let block = state.activeQuestionBlocks.list[activeQuestionBlockId]
    if (!block) {
      return
    }
    let activeQuestions = block.activeQuestions
    activeQuestions.forEach(id => 
      dispatch({
        type: QUESTION_LOCAL_FINISH,
        id
      })
    )
  }
}

let activeLoadUsersRequest = false
export function loadUsers(activeQuestionBlockId) {
  return async (dispatch, getState) => {
    if (activeLoadUsersRequest) {
      return
    }

    activeLoadUsersRequest = true

    let usersIds = getUserIds(getState(), activeQuestionBlockId)
    
    let promises = usersIds.map(id => dispatch(loadSingleUser(id)))
    await Promise.all(promises)

    activeLoadUsersRequest = false
  }
}

let activeLoadQuestionsRequest = false
export function loadActiveQuestions(activeQuestionBlockId) {
  return async (dispatch, getState) => {
    if (activeLoadQuestionsRequest) {
      return
    }

    activeLoadQuestionsRequest = true

    console.log(activeQuestionBlockId)
    console.log(getState())    

    activeLoadQuestionsRequest = false
  }
}
