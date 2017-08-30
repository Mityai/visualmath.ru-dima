import {query as moduleEditQuery} from '../edit'
import {query as moduleLoadQuery} from '../load'
import {query as listQuery} from '../list'

describe('module/edit', () => {
  let user
  let module
  
  it('edits module', mochaAsync(async () => {
    user = await userAdmin()
    module = await modulesFactory('module', user._id, 'content', 'script')
    
    let editedModule = await moduleEditQuery({
      body: {
        id: module._id,
        name: 'module_edited', 
        text: 'content_edited',
        script: 'edited script'
      }
    }, {}, user)
    
    editedModule.should.be.ok
    editedModule.should.have.property('name')
    editedModule.should.have.property('content')
    editedModule.should.have.property('script')
    
    editedModule.name.should.equal('module_edited')
    editedModule.content.should.equal('content_edited')
    editedModule.script.should.equal('edited script')

    let loadedModule = await moduleLoadQuery({body: {id: module._id}})

    loadedModule.should.have.property('name')
    loadedModule.should.have.property('content')
    loadedModule.should.have.property('script')

    loadedModule.name.should.equal('module_edited')
    loadedModule.content.should.equal('content_edited')
    loadedModule.script.should.equal('edited script')
  }))
  
  it('rejects on wrong id', mochaReject(async () => {
    await moduleEditQuery({body: {_id: 'bad id'}}, {}, user)
  }))
  
  after(done => require('mocha-mongoose')(dbURI)(done))
})
