'use strict'

// @flow

const Promise = require('bluebird')
const api = require('./api')
const Joi = require('joi')
import {StaRHsAPIClient} from './apiclient'
const config = require('./config')
const {key, user, password} = config.get('starhsapi')
const apiClient = new StaRHsAPIClient(key, user, password)
import loginHandler from './operations/login'
import statusHandler from './operations/status'
const operations = {
  login: loginHandler(apiClient),
  status: statusHandler
}
const HttpProblem = require('rheactor-models/http-problem')

export type ApiGatewayProxyEvent = {
  headers: ?{[id:string]: string},
  path: string,
  httpMethod: string,
  body: ?string
}

export function handler (event: ApiGatewayProxyEvent, context: any, callback: Function) {
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
      const operation = parts.shift()
      if (!operation.length || !operations[operation]) throw new HttpProblem('Error', `Unknown operation "${event.path}"`, 404)
      const v = Joi.validate(event.httpMethod, Joi.string().lowercase().required().valid(['GET', 'POST']))
      const method = v.value.toLowerCase()
      if (v.error || !operations[operation][method]) {
        throw new HttpProblem('Error', `Unsupported action "${event.httpMethod} ${event.path}"`, 400)
      }
      const body = event.body ? JSON.parse(event.body) : {}
      return operations[operation][method](body, parts)
    })
    .then(res => done(null, res))
    .catch(err => done(err))
}
