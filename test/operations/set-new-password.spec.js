/* global describe, it */

import {expect} from 'chai'
import {setNewPasswordOperation} from '../../src/operations/set-new-password'
import Promise from 'bluebird'
import {StaRHsAPIClient} from '../../src/apiclient'
import {URIValue} from 'rheactor-value-objects'
import {HttpProblem} from 'rheactor-models'
import {generateToken} from './token'

describe('/set-new-password', () => {
  it('should set the new password', () => {
    const body = {
      oldPassword: 'somepassword',
      newPassword: 'somenewpassword'
    }

    const mockClient = new StaRHsAPIClient('myapikey', 'apiuser', 'apipass')
    mockClient.setNewPassword = (sessionToken, oldPassword, newPassword) => {
      expect(sessionToken).to.equal('some-session-token')
      expect(oldPassword).to.equal(body.oldPassword)
      expect(newPassword).to.equal(body.newPassword)
      return Promise.resolve({
        'Message': 'Password has been set.'
      })
    }

    const newPassword = setNewPasswordOperation(mockClient)
    return generateToken()
      .then(token => newPassword.post(body, undefined, token))
  })

  it('should throw an exception if required data is missing', () => {
    const mockClient = new StaRHsAPIClient('myapikey', 'apiuser', 'apipass')
    const newPassword = setNewPasswordOperation(mockClient)
    const scenarios = [
      [{}, 'ValidationError: child "oldPassword" fails because ["oldPassword" is required]'],
      [{oldPassword: 'somepw'}, 'ValidationError: child "newPassword" fails because ["newPassword" is required]'],
      [{newPassword: 'somepw'}, 'ValidationError: child "oldPassword" fails because ["oldPassword" is required]'],
      [{oldPassword: '', newPassword: 'somenewpw'}, 'ValidationError: child "oldPassword" fails because ["oldPassword" is not allowed to be empty]'],
      [{newPassword: '', oldPassword: 'someoldpw'}, 'ValidationError: child "newPassword" fails because ["newPassword" is not allowed to be empty]']
    ]
    const p = []
    for (let i = 0; i < scenarios.length; i++) {
      p.push(newPassword.post(scenarios[i][0])
        .catch(err => {
          expect(err).to.be.instanceof(HttpProblem)
          expect(err.status).to.equal(400)
          expect(err.type.equals(new URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#ValidationFailed'))).to.equal(true)
          expect(err.title).to.equal(scenarios[i][1])
          expect(err.detail).to.not.equal(undefined)
        }))
    }
    return Promise.all(p)
  })
})
