export const STUDENT = 'student'
export const TEACHER = 'teacher'
export const ADMIN = 'admin'

export function level(role) {
  if (role === STUDENT) {
    return 1;
  } 
  
  if (role === TEACHER) {
    return 2;
  }
  
  if (role === ADMIN) {
    return 3;
  }
  
  return 0;
}
