import {JsonWebTokenType, HttpProblem} from 'rheactor-models'
import {URIValue, URIValueType} from 'rheactor-value-objects'
import staRHsStatusHandler from './starhs-status'
import {StaRHsAPIClientType} from '../apiclient'
import Joi from 'joi'
import {joiErrorToHttpProblem} from '../api'

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @param {object} parts
 * @param {JsonWebToken} token
 * @returns {Promise}
 */
const share = (mountURL, apiClient, body, parts, token) => {
  URIValueType(mountURL)
  StaRHsAPIClientType(apiClient)
  JsonWebTokenType(token)
  const schema = Joi.object().keys({
    to: Joi.string().trim().required(),
    message: Joi.string().trim().required(),
    amount: Joi.number().required().min(1).max(5)
  })
  const v = Joi.validate(body, schema, {convert: true})
  if (v.error) {
    return Promise.reject(joiErrorToHttpProblem(v.error))
  }

  return staRHsStatusHandler(apiClient).post({}, [token.sub], token)
    .then(
      /**
       * @param {StaRHsStatus} status
       */
      status => {
        if (status.cycleLeft < v.value.amount) throw new HttpProblem(URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#ValidationFailed'), `You have only ${status.cycleLeft} left in this cycle which is not enough to share a staRH with ${v.value.amount} staRHs.`, 400, v.error)
        return apiClient.shareStaRH(
          token.payload.SessionToken,
          v.value.to,
          v.value.amount,
          v.value.message
        )
      })
    .then(response => {
      return response
    })
}

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 */
export default function handler (mountURL, apiClient) {
  URIValueType(mountURL)
  return {
    post: share.bind(null, mountURL.slashless(), apiClient)
  }
}
