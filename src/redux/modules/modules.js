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
  EDIT_CONTENT,
  EDIT_VISUAL_MODULE,
  EDIT_IMAGES,
  FIND,
  FIND_FAIL,
  FIND_SUCCESS,
  STATUS_EDITING,
  // STATUS_EDITING_SUCCESS,
  STATUS_EDITING_FAIL,
  STATUS_WAS_NOT_EDITED,
  HIDE,
  HIDE_SUCCESS,
  HIDE_FAIL,
  UNHIDE,
  UNHIDE_SUCCESS,
  UNHIDE_FAIL,
  IMAGE_UPLOAD,
  IMAGE_UPLOAD_SUCCESS,
  IMAGE_UPLOAD_FAIL
} from 'actions/modules'

function moduleIndexAndElement(state, id) {
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
  let [index, element] = moduleIndexAndElement(state, id)
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
    /* let images = action.result.images;
    let _id = action.result._id;
    console.log('POST SUCCESS');
    console.log(_id)
    console.log(images); */
    return {
      ...state,
      posting: false
    };
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

  [EDIT_CONTENT](state, {id, content}) {
    return higherOrderEdit(state, id, 'content', content)
  },

  [EDIT_VISUAL_MODULE](state, {id, visualModule}) {
    return higherOrderEdit(state, id, 'visualModule', visualModule)
  },

  [EDIT_IMAGES](state, {id, images, imagesLeft, imagesTop, imagesScale}) {
    console.log('Update state!')
    let _state = higherOrderEdit(state, id, 'images', images);
    console.log(state.images)
    _state = higherOrderEdit(_state, id, 'imagesLeft', imagesLeft);
    console.log(_state.imagesLeft);
    _state = higherOrderEdit(_state, id, 'imagesTop', imagesTop);
    console.log(_state.imagesTop)
    _state = higherOrderEdit(_state, id, 'imagesScale', imagesScale);
    console.log(_state.imagesScale)
    return _state;
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

  [HIDE_SUCCESS](state, {result: {_id}}) {
    return higherOrderEdit(state, _id, 'hidden', true)
  },

  [UNHIDE_SUCCESS](state, {result: {_id}}) {
    return higherOrderEdit(state, _id, 'hidden', false)
  },

  [LOGOUT_SUCCESS]() {
    return initialState
  },

  [IMAGE_UPLOAD](state) {
    return {
      ...state,
      uploading: {
        status: true
      }
    }
  },

  [IMAGE_UPLOAD_SUCCESS](state) {
    return {
      ...state,
      uploading: {
        status: false
      }
    }
  },

  [IMAGE_UPLOAD_FAIL](state) {
    return {
      ...state,
      uploading: {
        status: false,
        error: 'Failed!'
      }
    }
  }
}

export default createReducer(initialState, handlers)

export function addModule(name, text, visualModule, images, imagesLeft, imagesTop, imagesScale) {
  return {
    types: [POST, POST_SUCCESS, POST_FAIL],
    promise: client => client.post('/module/add', {
      data: {
        text,
        name,
        visualModule,
        images,
        imagesLeft,
        imagesTop,
        imagesScale
      }
    })
  }
}

export function editModule(id, {text, name, visualModule, images, imagesLeft, imagesTop, imagesScale}) {
  return {
    types: [EDIT, EDIT_SUCCESS, EDIT_FAIL],
    promise: client => client.post('/module/edit', {
      data: {
        id,
        text,
        name,
        visualModule,
        images,
        imagesLeft,
        imagesTop,
        imagesScale
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

export function editContent(id, content) {
  return {
    type: EDIT_CONTENT,
    id,
    content
  }
}

export function editVisualModule(id, visualModule) {
  return {
    type: EDIT_VISUAL_MODULE,
    id,
    visualModule
  }
}

export function editImages(id, images, imagesLeft, imagesTop, imagesScale) {
  console.log('edit')
  return {
    type: EDIT_IMAGES,
    id,
    images,
    imagesLeft,
    imagesTop,
    imagesScale
  }
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: client => client.get('/module/list')
  }
}

export function loadSingle(id) {
  return {
    types: [LOAD_SINGLE, LOAD_SINGLE_SUCCESS, LOAD_SINGLE_FAIL],
    promise: client => client.post('/module/load', {
      data: {
        id
      }
    })
  }
}

export function findModule(query) {
  return {
    types: [FIND, FIND_SUCCESS, FIND_FAIL],
    promise: client => client.post('/module/loadByQuery', {
      data: {
        query
      }
    })
  }
}

export function hide(id) {
  return {
    types: [HIDE, HIDE_SUCCESS, HIDE_FAIL],
    promise: client => client.post('/module/hide', {
      data: {
        id
      }
    })
  }
}

export function unhide(id) {
  return {
    types: [UNHIDE, UNHIDE_SUCCESS, UNHIDE_FAIL],
    promise: client => client.post('/module/unhide', {
      data: {
        id
      }
    })
  }
}

export function isLoaded(globalState) {
  return globalState.modules && globalState.modules.loaded
}

export function getModules(globalState) {
  return globalState.modules
}

export function getModulesArray(globalState) {
  let modules = getModules(globalState)
  if (!modules || !modules.data) return []
  return modules.data
}

export function getModuleById(globalState, id) {
  if (!globalState.modules || !globalState.modules.data) {
    return null
  }

  return globalState.modules.data.filter(({_id}) => id === _id)[0]
}

export function moduleImageSave({fileName, data, path}) {
  return {
    types: [IMAGE_UPLOAD, IMAGE_UPLOAD_SUCCESS, IMAGE_UPLOAD_FAIL],
    promise: client => {
      return client.post('/uploadStatic', {
        data: {
          fileName,
          data,
          path
        }
      })
    }
  }
}


