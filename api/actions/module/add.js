import {Module} from '../../models/module'
import {access} from '../../utils/access'
import {TEACHER} from '../../utils/roleLevels'
import * as fs from 'fs'
import * as path from 'path'

const PATH = path.join(__dirname,'../../../static_data/');

export let errors = {
  name: 'name должно быть определено',
  savingError: `ошибка во время сохранения`
}

export let query = async({body}, res, user) => {
  console.info('module/add')
  if (!body.name) {
    console.error('name must be defined')
    return Promise.reject(errors.name)
  }

  console.info('author', user._id)
  console.info('name', body.name)
  console.info('text', body.text)
  console.info('visualModule', body.visualModule)

  let module = new Module({
    author: user._id,
    name: body.name,
    content: body.text,
    visualModule: body.visualModule,
    images: body.images,
    imagesTop: body.imagesTop,
    imagesLeft: body.imagesLeft,
    imagesScale: body.imagesScale
  })

  console.info('saving module')

  if(body.images.length > 0){
    let filePath = body.images[0].split('=')[1].split('/');
    filePath.pop();
    filePath = filePath.join('/');
    while(!fs.existsSync(PATH+filePath)){

    }
    fs.renameSync(PATH+filePath, PATH+'modules/' + module._id);
    module.images.forEach( (src, id, img)=>{
      img[id] = '/api/loadStatic?file=modules/'+module._id+'/'+ src.split('/').pop();
    } );
  }

  console.info('resaving module')

  return await module.save();

}

export default access(
  TEACHER,
  query
)
