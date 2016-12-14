'use strict'

/* global describe, it */

const expect = require('chai').expect
const JsonWebToken = require('rheactor-models/jsonwebtoken')
const jwt = require('jsonwebtoken')
import staRHsStatusHandler from '../../src/operations/starhs-status'
import Promise from 'bluebird'
import {StaRHsAPIClient} from '../../src/apiclient'
import {StaRHsStatusType} from 'starhs-models'

describe('/staRHsStatus', () => {
  it('should return status', () => {
    const mockClient = new StaRHsAPIClient('myapikey', 'apiuser', 'apipass')
    mockClient.getStaRHsStatus = (sessionToken) => {
      expect(sessionToken).to.equal('some-session-token')
      return Promise.resolve({
        'PKUser': '9d1ecf8d-996e-4e5a-99e7-1a751157903a',
        'PKClient': '08c5e90b-80b6-4245-b592-ccbc2a091634',
        'Forename': '',
        'Name': 'Antarctica',
        'Kunde1': 'Resourceful Humans',
        'Kunde2': '',
        'CycleFrom': '2016-12-12T00:00:00',
        'CycleTo': '2016-12-18T23:59:00',
        'CycleType': 'week',
        'CycleName': '',
        'CycleStaRHsToShare': 10,
        'YouHaveShared': 1,
        'YouHaveReceived': 2,
        'YouHaveLeft': 8,
        'TotalShared': 19,
        'TotalReceived': 11,
        'ShowStarMap': false
      })
    }
    const status = staRHsStatusHandler(mockClient)
    Promise.try(() => jwt.sign(
      {
        SessionToken: 'some-session-token'
      },
      'myapikey.apiuser.apipass',
      {
        algorithm: 'HS256',
        issuer: 'login',
        subject: 'some-user-name',
        expiresIn: 60 * 60
      }))
      .then(token => status.post({}, [], new JsonWebToken(token))
        .then(
          /**
           * @param {StaRHsStatus} status
           */
          status => {
            StaRHsStatusType(status)
            expect(status.cycleShared).to.equal(1)
            expect(status.cycleReceived).to.equal(2)
            expect(status.cycleLeft).to.equal(8)
            expect(status.totalShared).to.equal(19)
            expect(status.totalReceived).to.equal(11)
          }
        )
      )
  })
})
