'use strict'

/* global describe, it */

const expect = require('chai').expect
const api = require('../src/api')
const JsonWebToken = require('rheactor-models/jsonwebtoken')
const jwt = require('jsonwebtoken')
const Promise = require('bluebird')

describe('api', () => {
  describe('checkContentType()', () => {
    it('should return true if correct content-type is provided', () => {
      expect(api.checkContentType({headers: {'Content-type': api.CONTENT_TYPE}})).to.equal(true)
    })
    it('should throw an exception if no headers passed', () => {
      expect(() => {
        api.checkContentType({})
      }).to.throw('Must provide Content-Type.')
    })
    it('should throw an exception if wrong content-type passed', () => {
      expect(() => {
        api.checkContentType({headers: {'Content-Type': 'application/json'}})
      }).to.throw('Unsupported content type: "application/json".')
    })
  })
  describe('getOptionalToken()', () => {
    it('should return undefined if no token provided', () => {
      api.getOptionalToken({headers: {}})
        .then(token => expect(token).to.equal(undefined))
    })
    it('should throw and exception if Bearer Authorization is not used', () => {
      expect(() => {
        api.getOptionalToken({headers: {'Authorization': 'foo'}})
      }).to.throw('Must provide bearer authorization!')
    })
    it('should reject request if aninvalid token is provided', done => {
      api.getOptionalToken({headers: {'Authorization': 'Bearer foo'}})
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
        .then(token => api.getOptionalToken({headers: {'Authorization': `Bearer ${token}`}})
          .then(foundToken => {
            expect(foundToken).to.be.instanceof(JsonWebToken)
            expect(foundToken.token).to.equal(token)
            done()
          })
        )
    })
  })
})
