import createReducer from './lib/createReducer'
import keyBy from 'lodash/keyBy'
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'

import {LOGOUT_SUCCESS} from '../../actions/auth'

import {
  ADD,
  ADD_FAIL,
  ADD_SUCCESS,
  LIST,
  LIST_FAIL,
  LIST_SUCCESS,
  LOAD,
  LOAD_FAIL,
  LOAD_SUCCESS,
  START,
  START_FAIL,
  START_SUCCESS,
  FINISH,
  FINISH_FAIL,
  FINISH_SUCCESS,
  EDIT,
  EDIT_FAIL,
  EDIT_SUCCESS,
  EDIT_MODE,
  EDIT_QUESTION,
  EDIT_IMAGES,
  EDIT_ANSWERS,
  EDIT_CORRECT_ANSWERS,
  EDIT_MULTIPLE,
  EDIT_DIFFICULTY,
  STATUS_EDITING,
  // STATUS_EDITING_SUCCESS,
  STATUS_EDITING_FAIL,
  STATUS_WAS_NOT_EDITED,
} from 'actions/questions'

import {
  LOAD_SINGLE_SUCCESS as LOAD_SINGLE_BLOCK_SUCCESS
} from 'actions/questionBlocks'

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
  loaded: false,
  list: {},
  editing: {
    status: STATUS_WAS_NOT_EDITED,
    id: null
  }
};

export let handlers = {
  [ADD_SUCCESS](state, {result}) {
    return {
      ...state,
      list: {
        ...state.list,
        [result._id]: result
      }
    };
  },

  [LOAD_SUCCESS](state, {result}) {
    return {
      ...state,
      list: {
        ...state.list,
        [result._id]: result
      }
    };
  },

  [LIST_SUCCESS](state, {result}) {
    return {
      ...state,
      list: merge(state.list, keyBy(result, '_id'))
    };
  },

  [LOAD_SINGLE_BLOCK_SUCCESS](state, { result }) {
    if (typeof result.questionsIds === 'string') {
      return state
    }

    let newState = cloneDeep(state)

    result.questionsIds.forEach(question => {
      if (!newState.list[question._id]) {
        newState.list[question._id] = question
      }
    })

    return newState
  },

  [LOGOUT_SUCCESS]() {
    return initialState;
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

  [EDIT_QUESTION](state, {id, question}) {
    return higherOrderEdit(state, id, 'question', question)
  },

  [EDIT_ANSWERS](state, {id, answers}) {
    return higherOrderEdit(state, id, 'answers', answers)
  },

  [EDIT_IMAGES](state, {id, images}) {
    let element = cloneDeep(state.list[id])
    element.images = images.images
    element.imagesLeft = images.imagesLeft
    element.imagesTop = images.imagesTop
    element.imagesScale = images.imagesScale

    let list = cloneDeep(state.list)
    list[id] = element

    return {
      ...state,
      list
    }
  },

  [EDIT_CORRECT_ANSWERS](state, {id, correctAnswers}) {
    return higherOrderEdit(state, id, 'correctAnswers', correctAnswers)
  },

  [EDIT_MULTIPLE](state, {id, multiple}) {
    return higherOrderEdit(state, id, 'multiple', multiple)
  },

  [EDIT_DIFFICULTY](state, {id, difficulty}) {
    return higherOrderEdit(state, id, 'difficulty', difficulty)
  }
};

export default createReducer(initialState, handlers);

// ----- ----- ----- -----
// actions

export function addQuestion({question, answers, correctAnswers, multiple, images, imagesLeft, imagesTop, imagesScale, isAnswerSymbolic, difficulty}) {
  return {
    types: [ADD, ADD_SUCCESS, ADD_FAIL],
    promise: client => client.post('/questions/add', {
      data: {
        question,
        answers,
        correctAnswers,
        multiple,
        images,
        imagesLeft,
        imagesTop,
        imagesScale,
        isAnswerSymbolic,
        difficulty
      }
    })
  };
}

export function list() {
  return {
    types: [LIST, LIST_SUCCESS, LIST_FAIL],
    promise: client => client.get('/questions/list')
  };
}

export function loadSingle(id) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: client => client.post('/questions/load', {
      data: {
        id
      }
    })
  };
}

export function start(activeLectureId, questionId) {
  return {
    types: [START, START_SUCCESS, START_FAIL],
    promise: client => client.post('/questions/start', {
      data: {
        activeLectureId,
        questionId
      }
    })
  };
}

export function finish(activeLectureId, activeQuestionId) {
  return {
    types: [FINISH, FINISH_SUCCESS, FINISH_FAIL],
    promise: client => client.post('/questions/finish', {
      data: {
        activeLectureId,
        activeQuestionId
      }
    })
  };
}


export function editQuestion(id, {question, answers,
  correctAnswers, multiple, images, imagesLeft, imagesTop, imagesScale, isAnswerSymbolic, difficulty}) {
  return {
    types: [EDIT, EDIT_SUCCESS, EDIT_FAIL],
    promise: client => client.post('/questions/edit', {
      data: {
        id,
        question,
        answers,
        correctAnswers,
        multiple,
        images,
        imagesLeft,
        imagesTop,
        imagesScale,
        isAnswerSymbolic,
        difficulty
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

export function editQuestionText(id, question) {
  return {
    type: EDIT_QUESTION,
    id,
    question
  }
}

export function editAnswers(id, answers) {
  return {
    type: EDIT_ANSWERS,
    id,
    answers
  }
}

export function editImages(id, images) {
  return {
    type: EDIT_IMAGES,
    id,
    images
  }
}

export function editCorrectAnswers(id, correctAnswers) {
  return {
    type: EDIT_CORRECT_ANSWERS,
    id,
    correctAnswers
  }
}

export function editMultiple(id, multiple) {
  return {
    type: EDIT_MULTIPLE,
    id,
    multiple
  }
}

export function editDifficulty(id, difficulty) {
  return {
    type: EDIT_DIFFICULTY,
    id,
    difficulty
  }
}

// selectors
export function getQuestionById(state, id) {
  if (!state.questions || !state.questions.list) {
    return null
  }

  return state.questions.list[id]
}
