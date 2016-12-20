'use strict'

import HttpProblem from 'rheactor-models/http-problem'
import URIValue from 'rheactor-value-objects/uri'
import staRHsStatusHandler from './starhs-status'
import {JsonWebTokenType} from '../api'
import {StaRHsAPIClient} from '../apiclient'
import Joi from 'joi'

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @param {object} parts
 * @param {JsonWebToken} token
 * @returns {Promise}
 */
const share = (mountURL, apiClient, body, parts, token) => {
  URIValue.Type(mountURL)
  StaRHsAPIClient.Type(apiClient)
  JsonWebTokenType(token)
  const schema = Joi.object().keys({
    to: Joi.string().trim().required(),
    message: Joi.string().trim().required(),
    amount: Joi.number().required().min(1).max(5)
  })
  const v = Joi.validate(body, schema, {convert: true})
  if (v.error) {
    throw new HttpProblem('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#ValidationFailed', v.error.toString(), 400, v.error)
  }

  return staRHsStatusHandler(apiClient).post({}, [token.sub], token)
    .then(
      /**
       * @param {StaRHsStatus} status
       */
      status => {
        if (status.cycleLeft < v.value.amount) throw new HttpProblem('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#ValidationFailed', `You have only ${status.cycleLeft} left in this cycle which is not enough to share a staRH with ${v.value.amount} staRHs.`, 400, v.error)
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
  URIValue.Type(mountURL)
  return {
    post: share.bind(null, mountURL.slashless(), apiClient)
  }
}
