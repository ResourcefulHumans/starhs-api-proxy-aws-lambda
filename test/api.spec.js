/* global describe, it */

import {expect} from 'chai'
import {checkContentType, CONTENT_TYPE, getOptionalToken} from '../src/api'
import {JsonWebToken} from 'rheactor-models'
import jwt from 'jsonwebtoken'
import Promise from 'bluebird'

describe('api', () => {
  describe('checkContentType()', () => {
    it('should return true if correct content-type is provided', () => {
      expect(checkContentType({headers: {'Content-type': CONTENT_TYPE}})).to.equal(true)
    })
    it('should throw an exception if no headers passed', () => {
      expect(() => {
        checkContentType({})
      }).to.throw('Must provide Content-Type.')
    })
    it('should throw an exception if wrong content-type passed', () => {
      expect(() => {
        checkContentType({headers: {'Content-Type': 'application/json'}})
      }).to.throw('Unsupported content type: "application/json".')
    })
  })
  describe('getOptionalToken()', () => {
    it('should return undefined if no token provided', () => {
      getOptionalToken({headers: {}})
        .then(token => expect(token).to.equal(undefined))
    })
    it('should throw and exception if Bearer Authorization is not used', () => {
      expect(() => {
        getOptionalToken({headers: {'Authorization': 'foo'}})
      }).to.throw('Must provide bearer authorization!')
    })
    it('should reject request if aninvalid token is provided', done => {
      getOptionalToken({headers: {'Authorization': 'Bearer foo'}})
        .catch(err => {
          expect(err.message).to.equal('jwt malformed')
          done()
        })
    })
    it('should accept the request if a valid token is provided', done => {
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
        .then(token => getOptionalToken({headers: {'Authorization': `Bearer ${token}`}})
          .then(foundToken => {
            expect(foundToken).to.be.instanceof(JsonWebToken)
            expect(foundToken.token).to.equal(token)
            done()
          })
        )
    })
  })
})
