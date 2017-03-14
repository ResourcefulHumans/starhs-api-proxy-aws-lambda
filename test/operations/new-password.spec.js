/* global describe, it */

import {expect} from 'chai'
import {newPasswordOperation} from '../../src/operations/new-password'
import Promise from 'bluebird'
import {StaRHsAPIClient} from '../../src/apiclient'
import {URIValue} from 'rheactor-value-objects'
import {HttpProblem} from 'rheactor-models'
import {StatusCodeError} from 'request-promise/errors'

describe('/new-password', () => {
  it('should reset the password', done => {
    const body = {
      username: 'someuser'
    }

    const mockClient = new StaRHsAPIClient('myapikey', 'apiuser', 'apipass')
    mockClient.sendNewPassword = (username) => {
      expect(username).to.equal(body.username)
      done()
      return Promise.resolve({
        'Message': 'A new Password has been send'
      })
    }

    const newPassword = newPasswordOperation(mockClient)
    return newPassword.post(body)
  })

  it('should throw an exception if required data is missing', () => {
    const mockClient = new StaRHsAPIClient('myapikey', 'apiuser', 'apipass')
    const newPassword = newPasswordOperation(mockClient)
    const scenarios = [
      [{}, 'ValidationError: child "username" fails because ["username" is required]'],
      [{username: ''}, 'ValidationError: child "username" fails because ["username" is not allowed to be empty]']
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

  it('should handle staRHs backend error 500 on invalid username', done => {
    const msg = '{"Message":"Fehler","ExceptionMessage":"Internal Error","ExceptionType":"System.Exception","StackTrace":null}'
    const mockClient = new StaRHsAPIClient('myapikey', 'apiuser', 'apipass')
    mockClient.sendNewPassword = (username) => Promise.try(() => {
      throw new StatusCodeError(
        500,
        JSON.parse(msg)
      )
    })

    const newPassword = newPasswordOperation(mockClient)
    newPassword.post({username: 'foo'})
      .catch(err => {
        expect(err).to.be.instanceof(HttpProblem)
        expect(err.status).to.equal(403)
        expect(err.type.equals(new URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#Forbidden'))).to.equal(true)
        expect(err.title).to.equal('Username not found')
        expect(err.detail).to.equal(msg)
        done()
      })
  })
})
