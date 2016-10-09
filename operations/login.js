'use strict'

const Promise = require('bluebird')
const Joi = require('joi')
const jwt = require('jsonwebtoken')
const APIClient = require('../apiclient')
const api = require('../api')
let staRHsAPIClient

const getAPIClient = () => Promise.try(() => {
  staRHsAPIClient = new APIClient(
    process.env.STARHSAPI__APIKEY,
    process.env.STARHSAPI__USER,
    process.env.STARHSAPI__PASSWORD
  )
  return staRHsAPIClient
})

const login = body => {
  const schema = Joi.object().keys({
    username: Joi.string().trim().required(),
    password: Joi.string().required().trim()
  })
  const v = Joi.validate(body, schema, {convert: true})
  if (v.err) {
    throw new api.HttpProblem('Validation failed', v.err, 400)
  }
  return getAPIClient()
    .then(client => {
      console.log(client)
      return client
    })
    .then(client => client.loginWithUserId(v.value.username, v.value.password))
    .then((session) => jwt.sign(
      {
        SessionToken: session.SessionToken
      },
        process.env.STARHSAPI__APIKEY + '.' + process.env.STARHSAPI__USER + '.' + process.env.STARHSAPI__PASSWORD,
      {
        algorithm: 'HS256',
        issuer: 'login',
        subject: v.value.username,
        expiresIn: 60 * 60
      }
      )
    )
}

module.exports = {
  post: login
}
