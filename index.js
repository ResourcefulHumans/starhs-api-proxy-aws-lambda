'use strict'

const Promise = require('bluebird')
const api = require('./api')
const Joi = require('joi')
const operations = {
  'login': require('./operations/login'),
  'status': require('./operations/status')
}

exports.handler = (event, context, callback) => {
  let statusCode = 200
  const done = (err, res) => {
    if (err && process.env.environment !== 'testing') console.error(err)
    if (err && !(err instanceof api.HttpProblem)) {
      err = new api.HttpProblem(err.constructor.name, err.message, 400)
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
      if (!operation.length || !operations[operation]) throw new api.HttpProblem('Error', `Unknown operation "${event.path}"`, 404)
      const v = Joi.validate(event.httpMethod, Joi.string().lowercase().required().valid(['GET', 'POST']))
      const method = v.value.toLowerCase()
      if (v.error || !operations[operation][method]) {
        throw new api.HttpProblem('Error', `Unsupported action "${event.httpMethod} ${event.path}"`, 400)
      }
      const body = event.body ? JSON.parse(event.body) : {}
      return operations[operation][method](body, parts)
    })
    .then(res => done(null, res))
    .catch(err => done(err))
}
