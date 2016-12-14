'use strict'

import {JsonWebTokenType} from '../api'
import {StaRHsAPIClient} from '../apiclient'
import {StaRHsStatus} from 'starhs-models'

/**
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @param {object} parts
 * @param {JsonWebToken} token
 * @returns {Promise.<Object>}
 */
const staRHsStatus = (apiClient, body, parts, token) => {
  StaRHsAPIClient.Type(apiClient)
  JsonWebTokenType(token)
  return apiClient.getStaRHsStatus(token.payload.SessionToken)
    .then(
      /**
       * @param {{PKUser: {String}, PKClient: {String}, Forename: {String}, Name: {String}, Kunde1: {String}, Kunde2: {String}, CycleFrom: {String}, CycleTo: {String}, CycleType: {String}, CycleName: {String}, CycleStaRHsToShare: {Number}, YouHaveShared: {Number}, YouHaveReceived: {Number}, YouHaveLeft: {Number}, TotalShared: {Number}, TotalReceived: {Number}, ShowStarMap: {Boolean}}} response
       */
      response => {
        return new StaRHsStatus(
          response.YouHaveShared,
          response.YouHaveReceived,
          response.YouHaveLeft,
          response.TotalShared,
          response.TotalReceived
        )
      }
    )
}

/**
 * @param {StaRHsAPIClient} apiClient
 */
export default (apiClient) => ({
  post: staRHsStatus.bind(null, apiClient)
})
