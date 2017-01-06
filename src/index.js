import Promise from 'bluebird'
import {CONTENT_TYPE, checkContentType, getOptionalToken} from './api'
import Joi from 'joi'
import {StaRHsAPIClient} from './apiclient'
import config from './config'
import indexHandler from './operations/apiindex'
import {handler as loginHandler} from './operations/login'
import staRHsStatusHandler from './operations/starhs-status'
import {handler as statusHandler} from './operations/status'
import profileHandler from './operations/profile'
import staRHsListHandler from './operations/starhs-list'
import colleaguesListHandler from './operations/colleagues-list'
import shareHandler from './operations/share'
import {JsonWebToken, HttpProblem, Status} from 'rheactor-models'
import {URIValue} from 'rheactor-value-objects'

const {key, user, password} = config.get('starhsapi')
const apiClient = new StaRHsAPIClient(key, user, password)
const mountURL = new URIValue(config.get('mount_url'))
const operations = {
  index: indexHandler(mountURL, {
    'status': Status.$context,
    'login': JsonWebToken.$context
  }),
  login: loginHandler(mountURL, apiClient),
  staRHsStatus: staRHsStatusHandler(apiClient),
  staRHs: staRHsListHandler(mountURL, apiClient),
  share: shareHandler(mountURL, apiClient),
  profile: profileHandler(mountURL, apiClient),
  colleagues: colleaguesListHandler(mountURL, apiClient),
  status: statusHandler
}

/**
 * @param {{headers: object, path: string, httpMethod: string, body: string, queryStringParameters: object}} event
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
        'Content-Type': CONTENT_TYPE,
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  Promise
    .try(() => {
      checkContentType(event)
      const parts = event.path.split('/')
      parts.shift()
      let operation = parts.shift()
      if (!operation.length || !operations[operation]) throw new HttpProblem('Error', `Unknown operation "${event.path}"`, 404)
      const v = Joi.validate(event.httpMethod, Joi.string().lowercase().required().valid(['GET', 'POST']))
      const method = v.value.toLowerCase()
      if (v.error || !operations[operation][method]) {
        throw new HttpProblem('Error', `Unsupported action "${event.httpMethod} ${event.path}"`, 400)
      }
      const body = event.body ? JSON.parse(event.body) : {}
      return getOptionalToken(event)
        .then(token => operations[operation][method](body, parts, token, event.queryStringParameters))
    })
    .then(res => done(null, res))
    .catch(err => done(err))
}
