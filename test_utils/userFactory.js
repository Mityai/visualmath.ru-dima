global.userFactory = (name, role) => {
  return new UserMongo({username: name, password: '123456', role}).save()
}

global.userAdmin = () => {
  return global.userFactory('admin', 'admin')
}

global.userTeacher = () => {
  return global.userFactory('teacher', 'teacher')
}

global.userStudent = () => {
  return global.userFactory('student', 'student')
}
