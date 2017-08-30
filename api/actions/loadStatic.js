/**
 * Created by booolbash on 18.11.16.
 */
import {access} from '../utils/access'
import {STUDENT} from '../utils/roleLevels'
import * as path from 'path'
const STATIC_PATH = path.join(__dirname, '../../static_data/');


let loadStatic = (req) => {
  let name = req.query.file;
  return (res) => {
    res.sendFile(STATIC_PATH + name)
  }
}

export default access(
  STUDENT,
  loadStatic
)
