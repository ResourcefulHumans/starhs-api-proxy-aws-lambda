import {StaRHsAPIClientType} from '../apiclient'
import Joi from 'joi'
import {joiErrorToHttpProblem} from '../util'

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

  return apiClient.setNewPassword(token.payload.SessionToken, v.value.oldPassword, v.value.newPassword).then(response => '')
}

/**
 * @param {StaRHsAPIClient} apiClient
 */
export const setNewPasswordOperation = (apiClient) => ({
  post: setNewPassword.bind(null, apiClient)
})
