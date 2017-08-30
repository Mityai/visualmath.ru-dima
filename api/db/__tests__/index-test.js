import connect from '../index'
import config from '../../config'
import {expect} from 'chai'

describe('connection', () => {
  it('returns connected or connecting mongoose', () => {
    let mongoose = connect(config)
    let state = mongoose.connection.readyState
    expect(state === 1 || state === 2).to.be.ok
  })
})
