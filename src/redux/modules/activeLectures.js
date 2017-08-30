import createReducer from './lib/createReducer';
import keyBy from 'lodash/keyBy';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach'
import fix from './lib/replaceObjectWithId';

import {
  LOAD_ONGOING,
  LOAD_ONGOING_FAIL,
  LOAD_ONGOING_SUCCESS,
  CHANGE_SLIDE,
  CHANGE_SLIDE_FAIL,
  CHANGE_SLIDE_SUCCESS,
  SLIDE_CHANGED,
  LOAD_SINGLE,
  LOAD_SINGLE_FAIL,
  LOAD_SINGLE_SUCCESS,
  LOCAL_CHANGE_SLIDE,
  LOCAL_LECTURE_FINISH,
  LOCAL_ADD_LECTURE,
  LOCAL_FINISH
} from 'actions/activeLectures';
import {FINISH_SUCCESS as LECTURE_FINISHED} from 'actions/lectures';
import {LOGOUT_SUCCESS} from '../../actions/auth';

import {getLecturesListAsIs} from './lectures';

let initialState = {
  loading: false,
  loaded: false,
  list: {}
};

function finishLecture(state, activeLecture) {
  console.log(activeLecture)
  return {
    ...state,
    list: merge(state.list, {[activeLecture._id]: activeLecture})
  };
}

export let handlers = {
  [LOAD_ONGOING](state) {
    return {
      ...state,
      loading: true
    };
  },

  [LOAD_ONGOING_SUCCESS](state, {result}) {
    let fixedResult = result.map(activeLecture => fix(activeLecture, ['lecture', 'speaker']));

    return {
      ...state,
      loading: false,
      loadingError: null,
      list: keyBy(fixedResult, '_id')
    };
  },

  [LOAD_ONGOING_FAIL](state, {error}) {
    return {
      ...state,
      loading: false,
      loadingError: error
    };
  },

  [LOAD_SINGLE_SUCCESS](state, {result}) {
    return {
      ...state,
      list: merge(state.list, {[result._id]: result})
    };
  },

  [LOAD_SINGLE_FAIL](state, {error}) {
    return {
      ...state,
      loadingError: error
    };
  },

  [LOCAL_CHANGE_SLIDE](state, {activeLectureId, moduleNumber}) {
    return {
      ...state,
      list: {
        ...state.list,
        [activeLectureId]: {
          ...state.list[activeLectureId],
          ongoingModule: moduleNumber
        }
      }
    };
  },

  [LECTURE_FINISHED](state, {result}) {
    return finishLecture(state, result);
  },

  [LOCAL_LECTURE_FINISH](state, {activeLecture}) {
    return finishLecture(state, activeLecture);
  },

  [LOCAL_ADD_LECTURE](state, {activeLecture}) {
    return {
      ...state,
      list: merge(state.list, {[activeLecture._id]: activeLecture})
    };
  },

  [LOCAL_FINISH](state, {id}) {
    return {
      ...state,
      list: {
        ...state.list,
        [id]: {
          ...state.list[id],
          ended: true
        }
      }
    };
  },

  [CHANGE_SLIDE](state) {
    return {
      ...state,
      changingSlide: true
    }
  },

  [SLIDE_CHANGED](state) {
    return {
      ...state,
      changingSlide: false
    }
  },

  [LOGOUT_SUCCESS]() {
    return initialState;
  }
};

export default createReducer(initialState, handlers);

// ----- ----- ----- -----
// selectors

export function getActiveLectures(state) {
  return state.activeLectures;
}

export function getActiveLecturesListAsIs(state) {
  let activeLectures = getActiveLectures(state);
  return activeLectures.list;
}

export function getOngoingLecturesEntities(state, {populate}) {
  let activeLecturesIds = Object.values(getActiveLecturesListAsIs(state)).map(({lecture}) => lecture);
  let lectures = getLecturesListAsIs(state);
  let entities = activeLecturesIds.map(id => lectures[id]);

  populate.forEach(({property, collection}) =>
    entities = entities.map(entity => {
      let clone = cloneDeep(entity);
      clone[property] = state[collection].list[clone[property]];
      return clone;
    })
  );

  return entities;
}

export function getOngoingLecturesList(state) {
  return Object.values(getActiveLecturesListAsIs(state));
}

export function listByLectureId(state, lectureId) {
  let activeLectures = []
  forEach(state.activeLectures.list, it => {
    if (it.lecture === lectureId) {
      activeLectures.push(it)
    }
  })
  
  return activeLectures.sort((first, second) => first.created - second.created)
}

export function getById(state, activeLectureId) {
  return state.activeLectures.list[activeLectureId]
}

// ----- ----- ----- -----
// actions

export function loadOngoing() {
  return {
    types: [LOAD_ONGOING, LOAD_ONGOING_SUCCESS, LOAD_ONGOING_FAIL],
    promise: client => client.get('/lectures/listOngoing')
  };
}

export function toggleSlide(lectureId, moduleNumber) {
  return {
    types: [CHANGE_SLIDE, CHANGE_SLIDE_SUCCESS, CHANGE_SLIDE_FAIL],
    promise: client => client.post('/lectures/changeSlide', {
      data: {
        id: lectureId,
        moduleNumber
      }
    })
  };
}

export function loadSingle(id) {
  return {
    types: [LOAD_SINGLE, LOAD_SINGLE_SUCCESS, LOAD_SINGLE_FAIL],
    promise: client => client.post('/activeLectures/load', {
      data: {
        id
      }
    })
  };
}

export function loadListByLectureId(lectureId) {
  return {
    types: [LOAD_ONGOING, LOAD_ONGOING_SUCCESS, LOAD_ONGOING_FAIL],
    promise: client => client.post('/activeLectures/listByLectureId', {
      data: {
        lectureId
      }
    })
  }
}

export function localChangeSlide(activeLectureId, moduleNumber) {
  return {
    type: LOCAL_CHANGE_SLIDE,
    activeLectureId,
    moduleNumber
  };
}

export function localLectureFinish(activeLecture) {
  return {
    type: LOCAL_LECTURE_FINISH,
    activeLecture
  };
}

export function localAdd(activeLecture) {
  return {
    type: LOCAL_ADD_LECTURE,
    activeLecture
  };
}

export function localFinish(activeLectureId) {
  return {
    type: LOCAL_FINISH,
    id: activeLectureId
  };
}

export function slideChanged() {
  return {
    type: SLIDE_CHANGED
  }
}
