'use strict'

const Promise = require('bluebird')
const api = require('./api')
const Joi = require('joi')
import {StaRHsAPIClient} from './apiclient'
const config = require('./config')
const {key, user, password} = config.get('starhsapi')
const apiClient = new StaRHsAPIClient(key, user, password)
import indexHandler from './operations/apiindex'
import loginHandler from './operations/login'
import staRHsStatusHandler from './operations/starhs-status'
import {StaRHsStatus, Profile} from 'starhs-models'
import {handler as statusHandler, Status} from './operations/status'
import profileHandler from './operations/profile'
import JsonWebToken from 'rheactor-models/jsonwebtoken'
import URIValue from 'rheactor-value-objects/uri'
const mountURL = new URIValue(config.get('mount_url'))
const operations = {
  index: indexHandler(mountURL, {
    'status': Status.$context,
    'login': new URIValue(JsonWebToken.$context),
    'profile': Profile.$context,
    'staRHsStatus': StaRHsStatus.$context
  }),
  login: loginHandler(apiClient),
  staRHsStatus: staRHsStatusHandler(apiClient),
  profile: profileHandler(apiClient),
  status: statusHandler
}
const HttpProblem = require('rheactor-models/http-problem')

/**
 * @param {{headers: {Object}, path: {String}, httpMethod: {String}, body: {String}}} event
 * @param {object} context
 * @param {function} callback
 */
export function handler (event, context, callback) {
  let statusCode = 200
  const done = (err, res) => {
    /* istanbul ignore next */
    if (err && config.get('environment') !== 'testing') console.error(err)
    if (err && !(err instanceof HttpProblem)) {
      err = new HttpProblem(err.constructor.name, err.message, 400)
    }
    return callback(null, {
      statusCode: err ? err.status : (res ? statusCode : 204),
      body: JSON.stringify(err || res),
      headers: {
        'Content-Type': api.CONTENT_TYPE
      }
    })
  }

  Promise
    .try(() => {
      api.checkContentType(event)
      const parts = event.path.split('/')
      parts.shift()
      let operation = parts.shift()
      if (!operation.length) operation = 'index'
      if (!operation.length || !operations[operation]) throw new HttpProblem('Error', `Unknown operation "${event.path}"`, 404)
      const v = Joi.validate(event.httpMethod, Joi.string().lowercase().required().valid(['GET', 'POST']))
      const method = v.value.toLowerCase()
      if (v.error || !operations[operation][method]) {
        throw new HttpProblem('Error', `Unsupported action "${event.httpMethod} ${event.path}"`, 400)
      }
      const body = event.body ? JSON.parse(event.body) : {}
      return api.getOptionalToken(event)
        .then(token => operations[operation][method](body, parts, token))
    })
    .then(res => done(null, res))
    .catch(err => done(err))
}
