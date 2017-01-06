/* global describe, it */

import {expect} from 'chai'
import {generateToken} from './token'
import shareHandler from '../../src/operations/share'
import Promise from 'bluebird'
import {StaRHsAPIClient} from '../../src/apiclient'
import {URIValue} from 'rheactor-value-objects'
const mountURL = new URIValue('https://api.example.com/')

describe('/share', () => {
  it('should share a staRH', done => {
    const mockClient = new StaRHsAPIClient('myapikey', 'apiuser', 'apipass')
    mockClient.getStaRHsStatus = (sessionToken) => {
      expect(sessionToken).to.equal('some-session-token')
      return Promise.resolve({
        'CycleStaRHsToShare': 10,
        'YouHaveShared': 1,
        'YouHaveReceived': 2,
        'YouHaveLeft': 8,
        'TotalShared': 19,
        'TotalReceived': 11
      })
    }
    mockClient.shareStaRH = (sessionToken, to, amount, message) => {
      expect(sessionToken).to.equal('some-session-token')
      expect(to).to.equal('some-user-id')
      expect(message).to.equal('a staRH for you')
      expect(amount).to.equal(2)
      done()
    }
    const share = shareHandler(mountURL, mockClient)
    generateToken()
      .then(token => share.post({
        to: 'some-user-id',
        message: 'a staRH for you',
        amount: 2
      }, [], token))
  })
})
