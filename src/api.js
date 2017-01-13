import config from './config'
import {forIn} from 'lodash'
import jwt from 'jsonwebtoken'
import {JsonWebToken, HttpProblem} from 'rheactor-models'
import Promise from 'bluebird'
import {struct, list, refinement, Boolean as BooleanType, String as StringType} from 'tcomb'
import {URIValue} from 'rheactor-value-objects'

export const CONTENT_TYPE = config.get('mime_type') + '; charset=utf-8'
const {key, user, password} = config.get('starhsapi')

/**
 * @param {Array<String>} headers
 * @param {String} header
 * @returns {String}
 */
export function header (headers, header) {
  if (!headers || headers === null) return false
  const lowerCaseHeaders = {}
  forIn(headers, (v, k) => {
    lowerCaseHeaders[k.toLowerCase()] = v
  })
  return lowerCaseHeaders[header.toLowerCase()]
}

/**
 * @param {{headers: {Object}, path: {String}, httpMethod: {String}, body: {String}}} event
 * @returns {boolean}
 */
export function checkContentType (event) {
  const ctype = header(event.headers, 'Content-Type')
  if (!ctype) {
    throw new Error('Must provide Content-Type.')
  }
  if (ctype.toLowerCase() !== CONTENT_TYPE.toLowerCase()) {
    throw new Error(`Unsupported content type: "${ctype}".`)
  }
  return true
}

/**
 * @param {{headers: {Object}, path: {String}, httpMethod: {String}, body: {String}}} event
 * @returns {boolean}
 */
export function getOptionalToken (event) {
  const authorization = header(event.headers, 'Authorization')
  if (!authorization) return Promise.resolve()
  if (!/^Bearer /.test(authorization)) throw new Error(`Must provide bearer authorization!`)
  const token = authorization.match(/^Bearer (.+)/)[1]
  return new Promise((resolve, reject) => {
    return jwt.verify(token, key + '.' + user + '.' + password, (error) => {
      if (error) return reject(error)
      return resolve(new JsonWebToken(token))
    })
  })
}

/**
 * Convert a Joi Error into a HttpProblem
 *
 * @param error
 * @returns {*}
 */
export function joiErrorToHttpProblem (error) {
  JoiErrorType(error)
  return new HttpProblem(
    new URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#ValidationFailed'),
    error.toString(),
    400,
    error.details.map(d => d.message).join(', ')
  )
}

const JoiErrorType = struct({
  isJoi: refinement(BooleanType, b => b, 'isJoiContext'),
  details: list(struct({message: StringType}))
}, 'JoiErrorType')
