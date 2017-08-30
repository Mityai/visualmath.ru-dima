import createReducer from './lib/createReducer';
import keyBy from 'lodash/keyBy';
import merge from 'lodash/merge';
// import cloneDeep from 'lodash/cloneDeep'

import {LOAD_ONGOING_SUCCESS} from '../../actions/activeLectures';
import {LOGOUT_SUCCESS} from '../../actions/auth';

import {
  ADD,
  ADD_FAIL,
  ADD_SUCCESS,
  LOAD_SINGLE,
  LOAD_SINGLE_FAIL,
  LOAD_SINGLE_SUCCESS,
  LOAD,
  LOAD_FAIL,
  LOAD_SUCCESS,
  START,
  START_FAIL,
  START_SUCCESS,
  FINISH,
  FINISH_FAIL,
  FINISH_SUCCESS,
  HIDE,
  HIDE_SUCCESS,
  HIDE_FAIL,
  UNHIDE,
  UNHIDE_SUCCESS,
  UNHIDE_FAIL
} from 'actions/lectures';

let initialState = {
  loaded: false,
  list: {}
};

export let handlers = {
  [ADD](state) {
    return {
      ...state,
      adding: true
    };
  },

  [ADD_FAIL](state) {
    return {
      ...state,
      adding: false,
      addingFailed: true
    };
  },

  [ADD_SUCCESS](state, {result}) {
    return {
      ...state,
      adding: false,
      addingFailed: false,
      newLectureId: result._id
    };
  },

  [LOAD_SINGLE](state) {
    return {
      ...state,
      loadingSingle: true
    };
  },

  [LOAD_SINGLE_SUCCESS](state, {result}) {
    return {
      ...state,
      loadingSingle: false,
      loadingSingleFailed: false,
      list: {
        ...state.list,
        [result._id]: result
      }
    };
  },

  [LOAD_SINGLE_FAIL](state) {
    return {
      ...state,
      loadingSingle: false,
      loadingSingleFailed: true
    };
  },

  [LOAD](state) {
    return {
      ...state,
      loading: true
    };
  },

  [LOAD_SUCCESS](state, {result}) {
    return {
      ...state,
      loading: false,
      loadingFailed: false,
      list: merge(state.list, keyBy(result, '_id'))
    };
  },

  [LOAD_FAIL](state) {
    return {
      ...state,
      loading: false,
      loadingFailed: true
    };
  },

  [LOAD_ONGOING_SUCCESS](state, {result}) {
    let lectures = result.map(({lecture}) => lecture);
    if (typeof lectures[0] !== 'object') {
      return state;
    }
    return {
      ...state,
      list: merge(state.list, keyBy(lectures, '_id'))
    };
  },

  [HIDE_SUCCESS](state, {result: {_id}}) {
    console.log(state, _id)
    return {
      ...state,
      list: {
        ...state.list,
        [_id]: {
          ...state.list[_id],
          hidden: true
        }
      }
    }
  },


  [UNHIDE_SUCCESS](state, {result: {_id}}) {
    console.log(state, _id)
    return {
      ...state,
      list: {
        ...state.list,
        [_id]: {
          ...state.list[_id],
          hidden: false
        }
      }
    }
  },

  [LOGOUT_SUCCESS]() {
    return initialState;
  }
};

export default createReducer(initialState, handlers);

// ----- ------ ------ ------
// selectors

export function getLectures(state) {
  return state.lectures;
}

export function getNewLectureId(state) {
  return getLectures(state).newLectureId;
}

export function getLectureById(state, id) {
  if (!state.lectures.list || !state.lectures.list[id]) {
    return null;
  }

  return state.lectures.list[id];
}

export function getModule(state, lectureId, moduleNumber) {
  let lecture = getLectureById(state, lectureId);
  if (!lecture) return null;
  let obj = lecture.modules[moduleNumber] ? lecture.modules[moduleNumber] : null;
  if (!obj) {
    return obj;
  }

  if (typeof obj === 'string') {
    return state.modules.data.filter(({_id}) => _id === obj)[0];
  }

  return obj;
}

export function lectureLength(state, lectureId) {
  let lecture = getLectureById(state, lectureId);
  if (!lecture) return null;
  return lecture.modules.length;
}

export function getLecturesList(state) {
  return Object.values(state.lectures.list);
}

export function getLecturesListAsIs(state) {
  return state.lectures.list;
}

// ----- ----- ----- -----
// actions

export function addLecture(name, modules, questions, questionBlocks, mapping) {
  return {
    types: [ADD, ADD_SUCCESS, ADD_FAIL],
    promise: client => client.post('/lectures/add', {
      data: {
        name,
        modules,
        questions,
        questionBlocks,
        mapping
      }
    })
  };
}

export function loadSingle(id) {
  return {
    types: [LOAD_SINGLE, LOAD_SINGLE_SUCCESS, LOAD_SINGLE_FAIL],
    promise: client => client.post('/lectures/load', {
      data: {
        id
      }
    })
  };
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: client => client.get('/lectures/list')
  };
}

export function start(id) {
  return {
    types: [START, START_SUCCESS, START_FAIL],
    promise: client => client.post('/lectures/start', {
      data: {
        id
      }
    })
  };
}

export function finish(id) {
  return {
    types: [FINISH, FINISH_SUCCESS, FINISH_FAIL],
    promise: client => client.post('/lectures/finish', {
      data: {
        id
      }
    })
  };
}

export function hide(id) {
  console.log('hide function enter');
  return {
    types: [HIDE, HIDE_SUCCESS, HIDE_FAIL],
    promise: client => client.post('/lectures/hide', {
      data: {
        id
      }
    })
  }
}

export function unhide(id) {
  console.log('hide function enter');
  return {
    types: [UNHIDE, UNHIDE_SUCCESS, UNHIDE_FAIL],
    promise: client => client.post('/lectures/unhide', {
      data: {
        id
      }
    })
  }
}
