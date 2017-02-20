import {StaRHsAPIClientType} from '../apiclient'
import Joi from 'joi'
import {joiErrorToHttpProblem} from '../util'
import {HttpProblem} from 'rheactor-models'
import {URIValue} from 'rheactor-value-objects'
import {StatusCodeError} from 'request-promise/errors'

/**
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @returns {Promise.<Object>}
 */
const newPassword = (apiClient, body) => {
  StaRHsAPIClientType(apiClient)
  const schema = Joi.object().keys({
    username: Joi.string().trim().required()
  })
  const v = Joi.validate(body, schema, {convert: true})
  if (v.error) {
    return Promise.reject(joiErrorToHttpProblem(v.error))
  }

  return apiClient.sendNewPassword(v.value.username)
    .catch(StatusCodeError, reason => {
      // API sends Status 500 when sending unknown username. See https://github.com/ResourcefulHumans/staRHs/issues/18
      if (reason.statusCode === 500 && reason.error.ExceptionMessage.match(/Internal Error/)) {
        throw new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#Forbidden'), 'Username not found', 403, JSON.stringify(reason.error))
      } else {
        throw reason
      }
    })
}

/**
 * @param {StaRHsAPIClient} apiClient
 */
export const newPasswordOperation = (apiClient) => ({
  post: newPassword.bind(null, apiClient)
})
