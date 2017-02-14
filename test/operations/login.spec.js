/* global describe, it */

import {expect} from 'chai'
import {JsonWebToken, HttpProblem} from 'rheactor-models'
import jwt from 'jsonwebtoken'
import {loginOperation, LoginSuccess} from '../../src/operations/login'
import {URIValue} from 'rheactor-value-objects'
import {StaRHsStatus, Profile} from 'starhs-models'
import {itShouldHaveLinkTo} from './helper'
import {StatusCodeError} from 'request-promise/errors'
import Promise from 'bluebird'

const mountURL = new URIValue('https://api.example.com/')

describe('/login', () => {
  it('should return a token', () => {
    const body = {
      username: 'someuser',
      password: 'somepass'
    }
    const login = loginOperation(
      mountURL,
      {
        loginWithUserId: (username, password) => {
          expect(username).to.equal(body.username)
          expect(password).to.equal(body.password)
          return Promise.resolve({
            SessionToken: 'abc'
          })
        }
      }
    )
    return login.post(body)
      .then(success => {
        expect(success).to.be.instanceof(LoginSuccess)
        // Validate token
        expect(success.token).to.be.instanceof(JsonWebToken)
        expect(success.token.iss).to.equal('login')
        expect(success.token.sub).to.equal(body.username)
        const inOnHourinSeconds = Math.round((Date.now() + (60 * 60 * 1000)) / 1000)
        expect(Math.round(new Date(success.token.exp).getTime() / 1000)).to.be.within(inOnHourinSeconds - 10, inOnHourinSeconds + 10)
        jwt.verify(success.token.token, 'myapikey.apiuser.apipass')
        // Validate links
        itShouldHaveLinkTo(success, Profile)
        itShouldHaveLinkTo(success, StaRHsStatus)
      })
  })
  it('should throw an exception if required data is missing', () => {
    const login = loginOperation(mountURL, {})
    const scenarios = [
      [{}, 'ValidationError: child "username" fails because ["username" is required]'],
      [{username: 'foo'}, 'ValidationError: child "password" fails because ["password" is required]'],
      [{password: 'foo'}, 'ValidationError: child "username" fails because ["username" is required]'],
      [{username: '', password: ''}, 'ValidationError: child "username" fails because ["username" is not allowed to be empty]'],
      [{username: 'foo', password: ''}, 'ValidationError: child "password" fails because ["password" is not allowed to be empty]']
    ]
    for (let i = 0; i < scenarios.length; i++) {
      login.post(scenarios[i][0])
        .catch(err => {
          expect(err).to.be.instanceof(HttpProblem)
          expect(err.status).to.equal(400)
          expect(err.type.equals(new URIValue('https://github.com/ResourcefulHumans/rheactor-aws-lambda#ValidationFailed'))).to.equal(true)
          expect(err.title).to.equal(scenarios[i][1])
          expect(err.detail).to.not.equal(undefined)
        })
    }
  })
  it('should throw an exception if extra data is passed', done => {
    const login = loginOperation(mountURL, {})
    login.post({username: 'foo', password: 'bar', extra: 'buzz'})
      .catch(err => {
        expect(err).to.be.instanceof(HttpProblem)
        expect(err.status).to.equal(400)
        expect(err.type.equals(new URIValue('https://github.com/ResourcefulHumans/rheactor-aws-lambda#ValidationFailed'))).to.equal(true)
        expect(err.title).to.equal('ValidationError: "extra" is not allowed')
        expect(err.detail).to.not.equal(undefined)
        done()
      })
  })
  it('should handle staRHs backend error 500 on invalid credentials', done => {
    const msg = '{"Message":"Fehler","ExceptionMessage":"Login credentials wrong! Generation of Session failed","ExceptionType":"System.Exception","StackTrace":null}'
    const login = loginOperation(mountURL, {
      loginWithUserId: () => Promise.try(() => {
        throw new StatusCodeError(
          500,
          JSON.parse(msg)
        )
      })
    })
    login.post({username: 'foo', password: 'bar'})
      .catch(err => {
        expect(err).to.be.instanceof(HttpProblem)
        expect(err.status).to.equal(403)
        expect(err.type.equals(new URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#Forbidden'))).to.equal(true)
        expect(err.title).to.equal('Login credentials wrong! Generation of Session failed')
        expect(err.detail).to.equal(msg)
        done()
      })
  })
})
