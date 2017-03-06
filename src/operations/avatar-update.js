/* globals Buffer */

import {StaRHsAPIClientType} from '../apiclient'
import {JsonWebTokenType} from 'rheactor-models'
import {URIValueType} from 'rheactor-value-objects'
import Joi from 'joi'
import {joiErrorToHttpProblem} from '../util'

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @param {object} parts
 * @param {JsonWebToken} token
 * @returns {Promise.<Object>}
 */
const avatarUpdate = (mountURL, apiClient, body, parts, token) => {
  StaRHsAPIClientType(apiClient)
  JsonWebTokenType(token)
  const username = parts[0]
  if (username !== token.sub) {
    return Promise.reject(new Error(`${username} is not you!`))
  }
  const schema = Joi.object().keys({
    file: Joi.string().required()
  })
  const v = Joi.validate(body, schema, {convert: true})
  if (v.error) {
    return Promise.reject(joiErrorToHttpProblem(v.error))
  }
  return apiClient.updateAvatar(token.payload.SessionToken, new Buffer(v.value.file, 'base64').toString('binary')).then(response => '')
}

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 */
export const avatarUpdateOperation = (mountURL, apiClient) => {
  URIValueType(mountURL)
  return {
    post: avatarUpdate.bind(null, mountURL.slashless(), apiClient)
  }
}
