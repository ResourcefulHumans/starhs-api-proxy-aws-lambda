'use strict'

const Joi = require('joi')
const jwt = require('jsonwebtoken')
const config = require('../config')
const {key, user, password} = config.get('starhsapi')
const HttpProblem = require('rheactor-models/http-problem')
import URIValue from 'rheactor-value-objects/uri'
import {toLink} from '../api'
import {irreducible} from 'tcomb'
import {Model, StaRHsStatus, Profile} from 'starhs-models'
import JsonWebToken from 'rheactor-models/jsonwebtoken'
import {merge} from 'lodash'
const JsonWebTokenType = irreducible('JsonWebTokenType', (x) => x instanceof JsonWebToken)
const $context = new URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#LoginSuccess')

export class LoginSuccess extends Model {
  /**
   * @param {{token: JsonWebToken}} fields
   */
  constructor (fields) {
    super({$context})
    const {token} = fields
    JsonWebTokenType(token)
    this.token = token
  }

  /**
   * @returns {{token: object, $links: Array<{href: string, $context: string}>, $context: string}}
   */
  toJSON () {
    return merge(
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
    return new LoginSuccess(merge(super.fromJSON(data), {token: new JsonWebToken(data.token)}))
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
  const schema = Joi.object().keys({
    username: Joi.string().trim().required(),
    password: Joi.string().required().trim()
  })
  const v = Joi.validate(body, schema, {convert: true})
  if (v.error) {
    throw new HttpProblem('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#ValidationFailed', v.error.toString(), 400, v.error)
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
    .then(token => {
      const result = new LoginSuccess({token: new JsonWebToken(token)})
      result.$links.push(toLink(new URIValue([mountURL.toString(), 'profile', v.value.username].join('/')), Profile.$context))
      result.$links.push(toLink(new URIValue([mountURL.toString(), 'staRHsStatus', v.value.username].join('/')), StaRHsStatus.$context))
      return result
    })
}

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 */
export function handler (mountURL, apiClient) {
  URIValue.Type(mountURL)
  return {
    post: login.bind(null, mountURL.slashless(), apiClient)
  }
}
