'use strict'

const Joi = require('joi')
const jwt = require('jsonwebtoken')
const JsonWebToken = require('rheactor-models/jsonwebtoken')
const config = require('../config')
const {key, user, password} = config.get('starhsapi')
const HttpProblem = require('rheactor-models/http-problem')

/**
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @returns {Promise.<JsonWebToken>}
 */
const login = (apiClient, body) => {
  const schema = Joi.object().keys({
    username: Joi.string().trim().required(),
    password: Joi.string().required().trim()
  })
  const v = Joi.validate(body, schema, {convert: true})
  if (v.error) {
    throw new HttpProblem('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda/wiki/errors#ValidationFailed', v.error.toString(), 400, v.error)
  }

  return apiClient.loginWithUserId(v.value.username, v.value.password)
    .then((session) => jwt.sign(
      {
        SessionToken: session.SessionToken
      },
      key + '.' + user + '.' + password,
      {
        algorithm: 'HS256',
        issuer: 'login',
        subject: v.value.username,
        expiresIn: 60 * 60
      })
    )
    .then(token => new JsonWebToken(token))
}

/**
 * @param {StaRHsAPIClient} apiClient
 */
export default (apiClient) => ({
  post: login.bind(null, apiClient)
})
