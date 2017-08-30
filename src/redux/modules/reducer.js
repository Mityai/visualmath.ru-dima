import { combineReducers } from 'redux'
import { routeReducer } from 'react-router-redux'
import {reducer as reduxAsyncConnect} from 'redux-async-connect'
import {reducer as form} from 'redux-form'

import auth from './auth'
import modules from './modules'
import lectures from './lectures'
import activeLectures from './activeLectures'
import users from './users'
import questions from './questions'
import activeQuestions from './activeQuestions'
import questionBlocks from './questionBlocks'
import activeQuestionBlocks from './activeQuestionBlocks'
import visualModules from './visualModules'
import lectureConstructor from './lectureConstructor'

export default combineReducers({
  routing: routeReducer,
  reduxAsyncConnect,
  auth,
  modules,
  lectures,
  activeLectures,
  users,
  form,
  questions,
  activeQuestions,
  questionBlocks,
  activeQuestionBlocks,
  visualModules,
  lectureConstructor,
})
