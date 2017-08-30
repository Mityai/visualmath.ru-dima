import createReducer from './lib/createReducer'
import cloneDeep from 'lodash/cloneDeep'

import {LOGOUT_SUCCESS} from '../../actions/auth'

import {
  POST,
  POST_FAIL,
  POST_SUCCESS,
  LOAD,
  LOAD_FAIL,
  LOAD_SUCCESS,
  LOAD_SINGLE,
  LOAD_SINGLE_FAIL,
  LOAD_SINGLE_SUCCESS,
  EDIT,
  EDIT_FAIL,
  EDIT_SUCCESS,
  EDIT_MODE,
  EDIT_NAME,
  EDIT_DESCRIPTION,
  EDIT_SCRIPT,
  FIND,
  FIND_FAIL,
  FIND_SUCCESS,
  STATUS_EDITING,
  // STATUS_EDITING_SUCCESS,
  STATUS_EDITING_FAIL,
  STATUS_WAS_NOT_EDITED,
  // HIDE,
  // HIDE_SUCCESS,
  // HIDE_FAIL,
  // UNHIDE,
  // UNHIDE_SUCCESS,
  // UNHIDE_FAIL
} from 'actions/visualModules'

function visualModuleIndexAndElement(state, id) {
  let indexInArray = -1
  let element = cloneDeep(state.data.filter(({_id}, index) => {
    if (_id === id) {
      indexInArray = index
      return true
    }

    return false
  })[0])

  return [indexInArray, element]
}

function higherOrderEdit(state, id, property, value) {
  let [index, element] = visualModuleIndexAndElement(state, id)
  element[property] = value
  let data = cloneDeep(state.data)
  data[index] = element

  return {
    ...state,
    data
  }
}

const initialState = {
  loaded: false,
  data: [],
  editing: {
    status: STATUS_WAS_NOT_EDITED,
    id: null
  }
}

export let handlers = {
  [POST](state) {
    return {
      ...state,
      posting: true
    }
  },

  [POST_SUCCESS](state) {
    return {
      ...state,
      posting: false
    }
  },

  [POST_FAIL](state) {
    return {
      ...state,
      posting: false
    }
  },

  [LOAD_SINGLE](state) {
    return {
      ...state,
      loading: true
    }
  },

  [LOAD_SINGLE_SUCCESS](state, action) {
    return {
      ...state,
      data: [...state.data, action.result],
      loading: false,
      error: null,
      loaded: true
    }
  },

  [LOAD_SINGLE_FAIL](state, {error}) {
    return {
      ...state,
      error,
      loading: false
    }
  },

  [LOAD](state) {
    return {
      ...state,
      loading: true
    }
  },

  [LOAD_SUCCESS](state, action) {
    return {
      ...state,
      data: action.result,
      error: null,
      loading: false,
      loaded: true
    }
  },

  [LOAD_FAIL](state, {error}) {
    return {
      ...state,
      data: null,
      error,
      loading: false,
      loaded: false
    }
  },

  [FIND](state) {
    return {
      ...state,
      loading: true
    }
  },

  [FIND_SUCCESS](state, action) {
    return {
      ...state,
      data: action.result,
      error: null,
      loading: false,
      loaded: true
    }
  },

  [FIND_FAIL](state, {error}) {
    return {
      ...state,
      data: null,
      error,
      loading: false,
      loaded: false
    }
  },

  [EDIT_MODE](state, {id, isActive}) {
    return higherOrderEdit(state, id, 'isEditing', isActive)
  },

  [EDIT_NAME](state, {id, name}) {
    return higherOrderEdit(state, id, 'name', name)
  },

  [EDIT_DESCRIPTION](state, {id, description}) {
    return higherOrderEdit(state, id, 'description', description)
  },

  [EDIT_SCRIPT](state, {id, script}) {
    return higherOrderEdit(state, id, 'script', script)
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

  // [HIDE_SUCCESS](state, {result: {_id}}) {
  //   return higherOrderEdit(state, _id, 'hidden', true)
  // },
  //
  // [UNHIDE_SUCCESS](state, {result: {_id}}) {
  //   return higherOrderEdit(state, _id, 'hidden', false)
  // },

  [LOGOUT_SUCCESS]() {
    return initialState
  }
}

export default createReducer(initialState, handlers)

export function addVisualModule(name, description, script) {
  return {
    types: [POST, POST_SUCCESS, POST_FAIL],
    promise: client => client.post('/visualModule/add', {
      data: {
        name,
        description,
        script
      }
    })
  }
}

export function editVisualModule(id, {name, description, script}) {
  return {
    types: [EDIT, EDIT_SUCCESS, EDIT_FAIL],
    promise: client => client.post('/visualModule/edit', {
      data: {
        id,
        name,
        description,
        script
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

export function editDescription(id, description) {
  return {
    type: EDIT_DESCRIPTION,
    id,
    description
  }
}

export function editScript(id, script) {
  return {
    type: EDIT_SCRIPT,
    id,
    script
  }
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: client => client.get('/visualModule/list')
  }
}

export function loadSingle(id) {
  return {
    types: [LOAD_SINGLE, LOAD_SINGLE_SUCCESS, LOAD_SINGLE_FAIL],
    promise: client => client.post('/visualModule/load', {
      data: {
        id
      }
    })
  }
}

export function findVisualModule(query) {
  return {
    types: [FIND, FIND_SUCCESS, FIND_FAIL],
    promise: client => client.post('/visualModule/loadByQuery', {
      data: {
        query
      }
    })
  }
}

export function isLoaded(globalState) {
  return globalState.visualModules && globalState.visualModules.loaded
}

export function getVisualModules(globalState) {
  return globalState.visualModules
}

export function getVisualModulesArray(globalState) {
  let visualModules = getVisualModules(globalState)
  if (!visualModules || !visualModules.data) return []
  return visualModules.data
}

export function getVisualModuleById(globalState, id) {
  if (!globalState.visualModules || !globalState.visualModules.data) {
    return null
  }

  return globalState.visualModules.data.filter(({_id}) => id === _id)[0]
}
