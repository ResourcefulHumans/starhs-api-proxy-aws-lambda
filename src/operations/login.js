import Joi from 'joi'
import jwt from 'jsonwebtoken'
import config from '../config'
import {URIValue, URIValueType} from 'rheactor-value-objects'
import {StaRHsAPIClientType} from '../apiclient'
import {irreducible} from 'tcomb'
import {StaRHsStatus, Profile} from 'starhs-models'
import {Link, Model, JsonWebToken, JsonWebTokenType, HttpProblem} from 'rheactor-models'
import {StatusCodeError} from 'request-promise/errors'
import {joiErrorToHttpProblem} from '../util'

const {key, user, password} = config.get('starhsapi')
const $context = new URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#LoginSuccess')

export class LoginSuccess extends Model {
  /**
   * @param {{token: JsonWebToken}} fields
   */
  constructor (fields) {
    super(Object.assign(fields, {$context}))
    const {token} = fields
    JsonWebTokenType(token)
    this.token = token
  }

  /**
   * @returns {{token: object, $links: Array<{href: string, $context: string}>, $context: string}}
   */
  toJSON () {
    return Object.assign(
      super.toJSON(),
      {
        token: this.token
      }
    )
  }

  /**
   * @param {{token: string}} data
   * @returns {LoginSuccess}
   */
  static fromJSON (data) {
    return new LoginSuccess(Object.assign(super.fromJSON(data), {token: new JsonWebToken(data.token)}))
  }

  /**
   * @returns {URIValue}
   */
  static get $context () {
    return $context
  }
}

export const LoginSuccessType = irreducible('LoginSuccessType', (x) => x instanceof LoginSuccess)

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @returns {Promise.<LoginSuccess>}
 */
const login = (mountURL, apiClient, body) => {
  URIValueType(mountURL)
  StaRHsAPIClientType(apiClient)
  const schema = Joi.object().keys({
    username: Joi.string().trim().required(),
    password: Joi.string().required().trim()
  })
  const v = Joi.validate(body, schema, {convert: true})
  if (v.error) {
    return Promise.reject(joiErrorToHttpProblem(v.error))
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
    .then(token => new LoginSuccess({
      token: new JsonWebToken(token),
      $links: [
        new Link(new URIValue([mountURL.toString(), 'profile', v.value.username].join('/')), Profile.$context),
        new Link(new URIValue([mountURL.toString(), 'staRHsStatus', v.value.username].join('/')), StaRHsStatus.$context)
      ]
    })
    )
    .catch(StatusCodeError, reason => {
      if (reason.statusCode === 500 && reason.error.ExceptionMessage.match(/Login credentials wrong/)) {
        throw new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#Forbidden'), reason.error.ExceptionMessage, 403, JSON.stringify(reason.error))
      } else {
        throw reason
      }
    })
}

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 */
export const loginOperation = (mountURL, apiClient) => {
  URIValueType(mountURL)
  return {
    post: login.bind(null, mountURL.slashless(), apiClient)
  }
}
