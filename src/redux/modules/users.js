import createReducer from './lib/createReducer';
import merge from 'lodash/merge';
import keyBy from 'lodash/keyBy';

import {
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS
} from '../../actions/auth';

import {LOAD_ONGOING_SUCCESS} from '../../actions/activeLectures';
import {
  LOAD_SINGLE,
  LOAD_SINGLE_FAIL,
  LOAD_SINGLE_SUCCESS,
  LOAD_ALL,
  LOAD_ALL_SUCCESS,
  LOAD_ALL_FAIL,
  EDIT,
  EDIT_SUCCESS,
  EDIT_FAIL,
  STATUS_EDITING,
  STATUS_EDITING_FAIL,
  CREATE,
  CREATE_SUCCESS,
  CREATE_FAIL
} from '../../actions/users';

let initialState = {
  list: {}
};

export let handlers = {
  [LOGIN_SUCCESS](state, {result}) {
    return {
      ...state,
      list: merge(state.list, {[result._id]: result})
    };
  },

  [LOAD_ONGOING_SUCCESS](state, {result}) {
    let speakers = result.map(({speaker}) => speaker);
    if (typeof speakers[0] !== 'object') {
      return state;
    }
    return {
      ...state,
      list: merge(state.list, keyBy(speakers, '_id'))
    };
  },

  [LOAD_SINGLE_SUCCESS](state, data) {
    let result = data.result;
    return {
      ...state,
      list: merge(state.list, {[result._id]: result})
    };
  },

  [LOGOUT_SUCCESS]() {
    return initialState;
  },

  [EDIT](state) {
    return {
      ...state,
      editing: {
        status: STATUS_EDITING,
      }
    }
  },

  [EDIT_SUCCESS](state) {
    return state;
  },

  [EDIT_FAIL](state, {id, error}) {
    return {
      ...state,
      editing: {
        status: STATUS_EDITING_FAIL,
        id,
        error
      }
    }
  },

  [LOAD_ALL_SUCCESS](state, data) {
    return {
      ...state,
      listAllUsers: data.result,
    }
  },

  [CREATE_SUCCESS](state, data) {
    return {
      ...state,
      created: true,
      createdUser: data.result
    }
  },

  [CREATE_FAIL](state, data) {
    return {
      ...state,
      created: false,
      createError: data.error
    }
  }
};

export default createReducer(initialState, handlers);

// ----- ------ ------ ------
// selectors

export function getUsersListAsIs(state) {
  return state.users.list;
}

export function getAllUsersListAsIs(state) {
  return state.users.listAllUsers
}

export function getById(state, id) {
  return state.users.list[id]
}

// ----- ----- ----- -----
// actions
export function loadSingle(userId) {
  return {
    types: [LOAD_SINGLE, LOAD_SINGLE_SUCCESS, LOAD_SINGLE_FAIL],
    promise: client => client.post('/users/load', {
      data: {
        id: userId
      }
    })
  };
}

export function saveUser(user, password) {
  return {
    types: [EDIT, EDIT_SUCCESS, EDIT_FAIL],
    promise: client=>client.post('/users/edit', {
      data: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        password: password,
        group: user.group,
        university: user.university
      }
    })
  };
}

export function loadAll() {
  return {
    types: [LOAD_ALL, LOAD_ALL_SUCCESS, LOAD_ALL_FAIL],
    promise: client => client.post('/users/loadAll')
  };
}

export function create(login, password, access, institution, group) {
  return {
    types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
    promise: client => client.post('/users/create', {data: {login, password, access, institution, group}})
  };
}
