/**
 * Created by karpovad on 27.03.16.
 */
import {Lecture} from '../../models/lecture';
import {ActiveLecture} from '../../models/activeLecture';
import {access} from '../../utils/access';
import {io} from '../../api';

export default function (actionName, ongoing) {
  return access('teacher', ({body: {id}}, res, user) => {
    if (!id) {
      return Promise.reject('lecture id must be provided');
    }

    return new Promise((resolve, reject) => {
      Lecture.findOne({_id: id})
        .exec((err, lecture) => {
          if (err) {
            console.error(err);
            reject(`Error lectures/${actionName}`);
            return;
          }

          lecture.save(err => {
            if (err) {
              console.error(err);
              reject(`${actionName}: error during updating`);
              return;
            }

            let query = {
              lecture: lecture._id,
              speaker: user._id
            };
            if (ongoing) {
              // create active lecture record
              let activeLecture = new ActiveLecture({
                lecture: lecture._id,
                speaker: user._id
              });

              activeLecture.save((err, activeLecture) => {
                if (err) {
                  console.error(err);
                  reject(`${actionName}: error during saving ACTIVE LECTURE`);
                  return;
                }

                io.emit(`lecture ${activeLecture._id}`, {action: actionName, activeLecture});
                resolve(activeLecture);
              });
            } else {
              ActiveLecture.findOne(query).exec((err, activeLecture) => {
                if (err) {
                  console.error(err);
                  reject(`Can't find ACTIVE LECTURE, ${query}`);
                  return;
                }

                activeLecture.ended = true;
                activeLecture.save(err => {
                  if (err) {
                    console.error(err);
                    reject(`${actionName}: error during updating ACTIVE LECTURE`);
                    return;
                  }

                  io.emit(`lecture ${activeLecture._id}`, {action: actionName, activeLecture});
                  resolve(activeLecture);
                });
              });
            }
          });
        });
    });
  });
}

export function handler() {
  return access('teacher', ({body: {id}}) => {
    if (!id) {
      return Promise.reject('lecture id must be provided');
    }
    
    return Lecture.findOne({_id: id})
      .exec()
      .then(lecture => {
        // do i need it?
        if (!lecture) {
          return Promise.reject('lecture not found');
        }
        /*
        let query = {
          lecture: lecture._id,
          speaker: user._id
        }; */
      })
  });  
}
