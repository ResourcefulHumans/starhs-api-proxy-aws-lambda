/* global describe, it, Buffer */

import {expect} from 'chai'
import {generateToken} from './token'
import {avatarUpdateOperation} from '../../src/operations/avatar-update'
import Promise from 'bluebird'
import {StaRHsAPIClient} from '../../src/apiclient'
import {URIValue} from 'rheactor-value-objects'
import fs from 'fs'
const mountURL = new URIValue('https://api.example.com/')

describe('/avatarUpdate', () => {
  it('should update the avatar', done => {
    const mockClient = new StaRHsAPIClient('myapikey', 'apiuser', 'apipass')
    const avatarData = fs.readFileSync('./test/data/kitten.jpg', 'binary')
    mockClient.updateAvatar = (sessionToken, pictureData) => {
      expect(sessionToken).to.equal('some-session-token')
      expect(pictureData).to.equal(avatarData)
      done()
      return Promise.resolve('{"Message":"Picture upload and update successfull"}')
    }
    const op = avatarUpdateOperation(mountURL, mockClient)
    generateToken()
      .then(token => {
        const imageBuffer = new Buffer(avatarData, 'binary') // eslint-disable-line
        return op.post({file: imageBuffer.toString('base64')}, ['some-user-name'], token)
      })
  })
})
