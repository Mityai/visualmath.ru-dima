import createReducer from './lib/createReducer'
import keyBy from 'lodash/keyBy'
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'

import {
  ADD,
  ADD_SUCCESS,
  ADD_FAIL,
  LOAD_LIST,
  LOAD_LIST_SUCCESS,
  LOAD_LIST_FAIL,
  LOAD_SINGLE,
  LOAD_SINGLE_SUCCESS,
  LOAD_SINGLE_FAIL,
  START,
  START_SUCCESS,
  START_FAIL,
  FINISH,
  FINISH_SUCCESS,
  FINISH_FAIL,
  EDIT,
  EDIT_MODE,
  EDIT_FAIL,
  EDIT_SUCCESS,
  EDIT_NAME,
  EDIT_QUESTIONS,
  STATUS_EDITING,
  // STATUS_EDITING_SUCCESS,
  STATUS_EDITING_FAIL,
  STATUS_WAS_NOT_EDITED,
} from 'actions/questionBlocks'

import {LOGOUT_SUCCESS} from 'actions/auth'

function higherOrderEdit(state, id, property, value) {
  let element = cloneDeep(state.list[id])
  element[property] = value
  let list = cloneDeep(state.list)
  list[id] = element

  return {
    ...state,
    list
  }
}

let initialState = {
  statuses: {
    addingBlock: false,
    loadingList: false,
    loadingSingle: false,
    starting: false
  },
  list: {},
  editing: {
    status: STATUS_WAS_NOT_EDITED,
    id: null
  }
}

export let handlers = {
  [ADD](state) {
    return {
      ...state,
      statuses: {
        ...state.statuses,
        addingBlock: true
      }
    }
  },

  [ADD_SUCCESS](state, { result }) {
    return {
      ...state,
      list: {
        ...state.list,
        [result._id]: result
      },
      statuses: {
        ...state.statuses,
        addingBlock: false
      }
    }
  },

  [ADD_FAIL](state) {
    return {
      ...state,
      statuses: {
        ...state.statuses,
        addingBlock: false
      }
    }
  },

  [LOAD_LIST](state) {
    return {
      ...state,
      statuses: {
        ...state.statuses,
        loadingList: true
      }
    }
  },

  [LOAD_LIST_SUCCESS](state, { result }) {
    return {
      ...state,
      list: merge(state.list, keyBy(result, '_id')),
      statuses: {
        ...state.statuses,
        loadingList: false
      }
    }
  },

  [LOAD_LIST_FAIL](state) {
    return {
      ...state,
      statuses: {
        ...state.statuses,
        loadingList: false
      }
    }
  },

  [LOAD_SINGLE](state) {
    return {
      ...state,
      statuses: {
        ...state.statuses,
        loadingSingle: true
      }
    }
  },

  [LOAD_SINGLE_SUCCESS](state, { result }) {
    let formattedResult = cloneDeep(result)
    formattedResult.questionsIds = formattedResult.questionsIds.map(it => it._id)

    return {
      ...state,
      list: {
        ...state.list,
        [formattedResult._id]: formattedResult
      },
      statuses: {
        ...state.statuses,
        loadingSingle: false
      }
    }
  },

  [LOAD_SINGLE_FAIL](state) {
    return {
      ...state,
      statuses: {
        ...state.statuses,
        loadingSingle: false
      }
    }
  },

  [START](state) {
    return {
      ...state,
      statuses: {
        ...state.statuses,
        starting: true
      }
    }
  },

  [START_SUCCESS](state) {
    return {
      ...state,
      statuses: {
        ...state.statuses,
        starting: false
      }
    }
  },

  [START_FAIL](state) {
    return {
      ...state,
      statuses: {
        ...state.statuses,
        starting: false
      }
    }
  },

  [LOGOUT_SUCCESS]() {
    return initialState
  },

  [EDIT](state, {id}) {
    return {
      ...state,
      editing: {
        status: STATUS_EDITING,
        id
      }
    }
  },

  [EDIT_SUCCESS](state) {
    // let newState = higherOrderEdit(state, id, 'isEditing', false)
    // console.log(STATUS_EDITING_SUCCESS, id)
    return state
   /* return {
      ...newState,
      editing: {
        status: STATUS_EDITING_SUCCESS,
        id
      }
    }*/
  },

  [EDIT_FAIL](state, {id, error}) {
    let newState = higherOrderEdit(state, id, 'isEditing', false)
    return {
      ...newState,
      editing: {
        status: STATUS_EDITING_FAIL,
        id,
        error
      }
    }
  },

  [EDIT_MODE](state, {id, isActive}) {
    return higherOrderEdit(state, id, 'isEditing', isActive)
  },

  [EDIT_NAME](state, {id, name}) {
    return higherOrderEdit(state, id, 'name', name)
  },

  [EDIT_QUESTIONS](state, {id, questions}) {
    return higherOrderEdit(state, id, 'questionsIds', questions)
  }
}

export default createReducer(initialState, handlers)


// actions

export function add(questionsIds, name) {
  return {
    types: [ADD, ADD_SUCCESS, ADD_FAIL],
    promise: client => client.post('/questionBlock/add', {
      data: {
        questionsIds,
        name
      }
    })
  }
}

export function list() {
  return {
    types: [LOAD_LIST, LOAD_LIST_SUCCESS, LOAD_LIST_FAIL],
    promise: client => client.get('/questionBlock/list')
  }
}

export function loadSingle(id) {
  return {
    types: [LOAD_SINGLE, LOAD_SINGLE_SUCCESS, LOAD_SINGLE_FAIL],
    promise: client => client.post('/questionBlock/load', {
      data: {
        id
      }
    })
  }
}

export function start(activeLectureId, questionBlockId) {
  return {
    types: [START, START_SUCCESS, START_FAIL],
    promise: client => client.post('/questionBlock/start', {
      data: {
        activeLectureId,
        questionBlockId
      }
    })
  }
}

export function finish(activeQuestionBlockId) {
  return {
    types: [FINISH, FINISH_SUCCESS, FINISH_FAIL],
    promise: client => client.post('/questionBlock/finish', {
      data: {
        activeQuestionBlockId
      }
    })
  }
}

export function editQuestionBlock(id, {questions, name}) {
  return {
    types: [EDIT, EDIT_SUCCESS, EDIT_FAIL],
    promise: client => client.post('/questionBlock/edit', {
      data: {
        id,
        questions,
        name
      }
    }),
    id
  }
}

export function activateEditMode(id, isActive) {
  return {
    type: EDIT_MODE,
    id,
    isActive
  }
}

export function editName(id, name) {
  return {
    type: EDIT_NAME,
    id,
    name
  }
}

export function editQuestions(id, questions) {
  return {
    type: EDIT_QUESTIONS,
    id,
    questions
  }
}


// selectors

export function getList(state) {
  return state.questionBlocks.list
}

export function getArray(state) {
  let list = getList(state)
  let array = []
  Object.keys(list).forEach(key => array.push(list[key]))
  return array
}

export function getExpanded(state, id) {
  let block = cloneDeep(state.questionBlocks.list[id])
  if (!block) {
    return null
  }
  block.questions = block.questionsIds.map(id => state.questions.list[id])
  return block
}
