import {
  LOAD,
  LOAD_SUCCESS,
  LOAD_FAIL,
  LOGIN,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  LOGOUT_SUCCESS,
  LOGOUT_FAIL,
  LOGIN_VK,
  LOGIN_VK_SUCCESS,
  LOGIN_VK_FAIL
} from '../../actions/auth';

const initialState = {
  loaded: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        user: action.result
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOGIN:
      return {
        ...state,
        loggingIn: true
      };
    case LOGIN_VK:
      return {
        ...state,
        loggingIn: true
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loggingIn: false,
        user: action.result
      };
    case LOGIN_VK_SUCCESS:
      return {
        ...state,
        loggingIn: false,
        user: action.result
      };
    case LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
        user: null,
        loginError: action.error
      };
    case LOGOUT:
      return {
        ...state,
        loggingOut: true
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        loggingOut: false,
        user: null
      };
    case LOGOUT_FAIL:
      return {
        ...state,
        loggingOut: false,
        logoutError: action.error
      };
    default:
      return state;
  }
}


// actions
export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/loadAuth')
  };
}

export function loginVK(data) {
  console.log(data);
  return {
    types: [LOGIN_VK, LOGIN_VK_SUCCESS, LOGIN_VK_FAIL],
    promise: (client) => client.post('/loginVk', {
      data: data
    })
  };
}

export function login(name, password) {
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: (client) => client.post('/login', {
      data: {
        name,
        password
      }
    })
  };
}

export function logout() {
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: (client) => client.get('/logout')
  };
}


// selectors
export function getCurrentUser(state) {
  return state.auth.user
}

export function currentUserId(state) {
  return state.auth.user._id
}

export function isLoaded(globalState) {
  return globalState.auth && globalState.auth.loaded;
}

export function getCurrentUserRole(state) {
  if (!state.auth || !state.auth.user) {
    return null;
  }

  return state.auth.user.role;
}

export function isLoggedIn(state) {
  return !(!state.auth || !state.auth.user);
}
