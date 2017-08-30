/**
 * Created by booolbash on 18.11.16.
 */
import * as fs from 'fs'
import * as Path from 'path'
import {access} from '../utils/access'
import {TEACHER} from '../utils/roleLevels'

const STATIC_PATH = Path.join(__dirname, '../../static_data/');

let uploadStatic = ({body: {fileName, data, path}}) => {
  let savePath = STATIC_PATH;
  for (let ind = 0; ind < path.length; ++ind) {
    savePath += path[ind];
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath);
    }
    savePath += '/';
  }
  let file = data.slice(data.indexOf('base64') + 7, data.length)
  fs.writeFileSync(savePath + fileName, file, 'base64');
  return 'File was saved!';
}

export default access(
  TEACHER,
  uploadStatic
)
