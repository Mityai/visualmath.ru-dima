import React from 'react'
import {IndexRoute, Route} from 'react-router'
import {isLoaded as isAuthLoaded, load as loadAuth} from 'redux/modules/auth'
import {
  App,
  Home,
  About,
  Login,
  LoginSuccess,
  NotFound,
  AddModule,
  ModulesList,
  AddModuleSuccess,
  ModulePreview,
  AddLecture,
  AddLectureSuccess,
  PreviewLecture,
  LecturesList,
  OngoingLectures,
  Lecture,
  AddQuestion,
  AddQuestionSuccess,
  QuestionsList,
  QuestionPreview,
  ThrashCan,
  AddBlock,
  BlocksList,
  LectureHistory,
  ActiveLectureDetails,
  VisualModulesList,
  VisualModulePreview,
  AddVisualModule,
  PersonLK,
  UsersList,
  RegisterForm,
  QuestionBlockPreview,
  LectureConstructor,
} from 'containers'

import {level as roleLevel, ADMIN} from '../api/utils/roleLevels'

export default (store) => {
  // returns function that checks if user has at least required role
  // if role === null || role === undefined then checks if user logged in
  function userRequirements(role) {
    return (nextState, replace, cb) => {
      function checkAuth() {
        const {auth: {user}} = store.getState()
        if (!user) {
          // oops, not logged in, so can't be here!
          replace('/')
        }

        if (!!role && roleLevel(role) > roleLevel(user && user.role)) {
          replace('/')
        }

        cb()
      }

      if (!isAuthLoaded(store.getState())) {
        store.dispatch(loadAuth()).then(checkAuth)
      } else {
        checkAuth()
      }
    }
  }

  function noLoginRequirements() {
    return (nextState, replace) => {
      function checkNotAuth() {
        const {auth: {user}} = store.getState()
        if (user) {
          replace('/')
        }
      }

      checkNotAuth()
    }
  }

  let requireLogin = userRequirements(null)
  let requireAdmin = userRequirements(ADMIN)
  let requireNotLogin = noLoginRequirements()

  /**
   * Please keep routes in alphabetical order
   */
  return (
    <Route path="/" component={App}>
      { /* Home (main) route */ }
      <IndexRoute component={Home}/>

      {/* Routes requiring not login */}
      <Route onEnter={requireNotLogin}>
        <Route path="register" component={RegisterForm}/>
      </Route>

      { /* Routes requiring login */ }
      <Route onEnter={requireLogin}>
        <Route path="loginSuccess" component={LoginSuccess}/>
        <Route path="lecturePreview/:lectureId/:moduleNumber" component={PreviewLecture}/>
        <Route path="lecturesList" component={LecturesList}/>
        <Route path="ongoingLectures" component={OngoingLectures}/>
        <Route path="lecture/:lectureId/:moduleNumber" component={Lecture}/>
        <Route path="PersonLK" component={PersonLK}/>
      </Route>

      <Route onEnter={requireAdmin}>
        <Route path="addQuestion" component={AddQuestion}/>
        <Route path="addModule" component={AddModule}/>
        <Route path="addQuestionSuccess" component={AddQuestionSuccess}/>
        <Route path="modulesList" component={ModulesList}/>
        <Route path="modulePreview/:moduleId" component={ModulePreview}/>
        <Route path="questionPreview/:questionId" component={QuestionPreview}/>
        <Route path="addModuleSuccess" component={AddModuleSuccess}/>
        <Route path="addLecture" component={AddLecture}/>
        <Route path="addLectureSuccess" component={AddLectureSuccess}/>
        <Route path="questionsList" component={QuestionsList}/>
        <Route path="thrashCan" component={ThrashCan}/>
        <Route path="addBlock" component={AddBlock}/>
        <Route path="blocksList" component={BlocksList}/>
        <Route path="lectureHistory/:lectureId" component={LectureHistory}/>
        <Route path="activeLectureDetails/:activeLectureId" component={ActiveLectureDetails}/>
        <Route path="visualModulesList" component={VisualModulesList}/>
        <Route path="addVisualModule" component={AddVisualModule}/>
        <Route path="visualModulePreview/:visualModuleId" component={VisualModulePreview}/>
        <Route path="lecture_constructor" component={LectureConstructor} />
        <Route path="usersList" component={UsersList}/>
        <Route path="questionBlockPreview/:questionBlockId" component={QuestionBlockPreview} />
      </Route>

      { /* Routes */ }
      <Route path="about" component={About}/>
      <Route path="login" component={Login}/>

      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404}/>
    </Route>
  )
}
