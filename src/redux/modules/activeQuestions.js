import createReducer from './lib/createReducer';
// import keyBy from 'lodash/keyBy';
// import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep'

import {LOGOUT_SUCCESS} from '../../actions/auth';

import {
  START_SUCCESS,
  FINISH_SUCCESS
} from 'actions/questions';

import {
  LOAD,
  LOAD_SUCCESS,
  LOAD_FAIL,
  UPDATE,
  ANSWER,
  ANSWER_SUCCESS,
  ANSWER_FAIL,
  LOCAL_FINISH
} from 'actions/activeQuestions'

import {
  START_SUCCESS as QUESTION_BLOCK_START_SUCCESS
} from 'actions/questionBlocks'

import {
  LOAD_SUCCESS as QUESTION_BLOCK_LOAD_SUCCESS
} from 'actions/activeQuestionBlocks'
let initialState = {
  loaded: false,
  list: {}
};

function questionBlockStartSucces(state, result) {
  let newState = cloneDeep(state)

  result.activeQuestions.forEach(activeQuestion => {
    if (!newState.list[activeQuestion._id]) {
      newState.list[activeQuestion._id] = activeQuestion
    }
  })    

  // console.log(newState)
  return newState
}

export let handlers = {
  [START_SUCCESS](state, {result}) {
    return {
      ...state, 
      list: {
        ...state.list,
        [result._id]: result
      }
    };
  },

  [FINISH_SUCCESS](state, {result}) {
    return {
      ...state,
      list: {
        ...state.list,
        [result._id]: result
      }
    };
  },

  [LOAD_SUCCESS](state, action) {
    let result = action.result
    // console.log(action)
    return {
      ...state,
      list: {
        ...state.list,
        [result._id]: result
      }
    };
  },

  [ANSWER_SUCCESS](state, {result}) {
    return {
      ...state,
      list: {
        ...state.list,
        [result._id]: result
      }
    };
  },

  [UPDATE](state, {result}) {
    return {
      ...state,
      list: {
        ...state.list,
        [result._id]: result
      }
    };
  },

  [QUESTION_BLOCK_START_SUCCESS](state, { result }) {
    return questionBlockStartSucces(state, result)
  },

  [QUESTION_BLOCK_LOAD_SUCCESS](state, { result }) {
    return questionBlockStartSucces(state, result)
  },

  [LOCAL_FINISH](state, { id }) {
    let activeQuestion = cloneDeep(state.list[id])
    activeQuestion.ended = true
    return {
      ...state,
      list: {
        ...state.list,
        [id]: activeQuestion
      }
    }
  },

  [LOGOUT_SUCCESS]() {
    return initialState;
  }
};

export default createReducer(initialState, handlers);

// ----- ----- ----- -----
// actions

// activeLectureId and questionId
export function listenQuestion(activeLecture, question) {
  // console.log(activeLecture, question)
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: client => client.post('/questions/loadActive', {
      data: {
        activeLecture,
        question
      }
    })
  };
}

export function update(activeQuestion) {
  return dispatch => {
    dispatch({
      type: UPDATE,
      result: activeQuestion
    });    
  };
}

export function answer(activeQuestionId, answer) {
  return {
    types: [ANSWER, ANSWER_SUCCESS, ANSWER_FAIL],
    promise: client => client.post('/questions/answer', {
      data: {
        activeQuestionId,
        answer
      }
    })
  };
}
