import {Lecture} from '../../models/lecture'
import {access} from '../../utils/access'

export default access(
  'teacher',
  ({body}, res, user) => {
    return new Promise((resolve, reject) => {
      if (!body.name) {
        reject('имя лекции не отправлено')
        return
      }

      if ((!body.modules || body.modules.length === 0) && 
      (!body.questions || body.questions.length === 0) &&
      (!body.questionBlocks || body.questionBlocks.length === 0)) {
        reject('список id модулей и/или вопросов не отправлен')
        return
      }

      let lecture = new Lecture({
        author: user._id,
        name: body.name,
        modules: body.modules,
        questions: body.questions,
        mapping: body.mapping,
        questionBlocks: body.questionBlocks
      })

      lecture.save(err => {
        if (err) {
          console.error(err)
          reject('ошибка во время сохранения')
        }

        resolve(lecture)
      })
    })
  }
)
