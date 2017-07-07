import {StaRHsAPIClientType} from '../apiclient'
import Joi from 'joi'
import {joiErrorToHttpProblem} from '../util'
import {StatusCodeError} from 'request-promise/errors'
import {HttpProblem} from 'rheactor-models'
import {URIValue} from 'rheactor-value-objects'

/**
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @param {JsonWebToken} token
 * @returns {Promise.<Object>}
 */
const setNewPassword = (apiClient, body, parts, token) => {
  StaRHsAPIClientType(apiClient)
  const schema = Joi.object().keys({
    oldPassword: Joi.string().trim().required(),
    newPassword: Joi.string().trim().required()
  })
  const v = Joi.validate(body, schema, {convert: true})
  if (v.error) {
    return Promise.reject(joiErrorToHttpProblem(v.error))
  }

  return apiClient
    .setNewPassword(token.payload.SessionToken, v.value.oldPassword, v.value.newPassword)
    .then(response => '')
    .catch(StatusCodeError, reason => {
      if (reason.statusCode === 500 && reason.error.ExceptionMessage.match(/OldPassword is wrong/)) {
        throw new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#Forbidden'), 'Current password is wrong', 403, JSON.stringify(reason.error))
      } else {
        throw reason
      }
    })
}

/**
 * @param {StaRHsAPIClient} apiClient
 */
export const setNewPasswordOperation = (apiClient) => ({
  post: setNewPassword.bind(null, apiClient)
})
