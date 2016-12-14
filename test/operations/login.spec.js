'use strict'

/* global describe, it */

const expect = require('chai').expect
const JsonWebToken = require('rheactor-models/jsonwebtoken')
const jwt = require('jsonwebtoken')
import loginHandler from '../../src/operations/login'
const HttpProblem = require('rheactor-models/http-problem')

describe('/login', () => {
  it('should return a token', () => {
    const body = {
      username: 'someuser',
      password: 'somepass'
    }
    const login = loginHandler({
      loginWithUserId: (username, password) => {
        expect(username).to.equal(body.username)
        expect(password).to.equal(body.password)
        return Promise.resolve({
          SessionToken: 'abc'
        })
      }
    })
    return login.post(body)
      .then(token => {
        expect(token).to.be.instanceof(JsonWebToken)
        expect(token.iss).to.equal('login')
        expect(token.sub).to.equal(body.username)
        const inOnHourinSeconds = Math.round((Date.now() + (60 * 60 * 1000)) / 1000)
        expect(Math.round(new Date(token.exp).getTime() / 1000)).to.be.within(inOnHourinSeconds - 10, inOnHourinSeconds + 10)
        jwt.verify(token.token, 'myapikey.apiuser.apipass')
      })
  })
  it('should throw an exception if required data is missing', () => {
    const login = loginHandler({})
    const scenarios = [
      [{}, 'ValidationError: child "username" fails because ["username" is required]'],
      [{username: 'foo'}, 'ValidationError: child "password" fails because ["password" is required]'],
      [{password: 'foo'}, 'ValidationError: child "username" fails because ["username" is required]'],
      [{username: '', password: ''}, 'ValidationError: child "username" fails because ["username" is not allowed to be empty]'],
      [{username: 'foo', password: ''}, 'ValidationError: child "password" fails because ["password" is not allowed to be empty]']
    ]
    for (let i = 0; i < scenarios.length; i++) {
      try {
        login.post(scenarios[i][0])
      } catch (err) {
        expect(err).to.be.instanceof(HttpProblem)
        expect(err.status).to.equal(400)
        expect(err.type).to.equal('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda/wiki/errors#ValidationFailed')
        expect(err.title).to.equal(scenarios[i][1])
        expect(err.detail).to.not.equal(undefined)
      }
    }
  })
  it('should throw an exception if extra data is passed', () => {
    const login = loginHandler({})
    try {
      login.post({username: 'foo', password: 'bar', extra: 'buzz'})
    } catch (err) {
      expect(err).to.be.instanceof(HttpProblem)
      expect(err.status).to.equal(400)
      expect(err.type).to.equal('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda/wiki/errors#ValidationFailed')
      expect(err.title).to.equal('ValidationError: "extra" is not allowed')
      expect(err.detail).to.not.equal(undefined)
    }
  })
})
