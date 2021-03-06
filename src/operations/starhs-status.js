import {JsonWebTokenType} from 'rheactor-models'
import {StaRHsAPIClientType} from '../apiclient'
import {StaRHsStatus} from 'starhs-models'

/**
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @param {object} parts
 * @param {JsonWebToken} token
 * @returns {Promise.<Object>}
 */
const staRHsStatus = (apiClient, body, parts, token) => {
  StaRHsAPIClientType(apiClient)
  JsonWebTokenType(token)
  return apiClient.getStaRHsStatus(token.payload.SessionToken)
    .then(
      /**
       * @param {{PKUser: {String}, PKClient: {String}, Forename: {String}, Name: {String}, Kunde1: {String}, Kunde2: {String}, CycleFrom: {String}, CycleTo: {String}, CycleType: {String}, CycleName: {String}, CycleStaRHsToShare: {Number}, YouHaveShared: {Number}, YouHaveReceived: {Number}, YouHaveLeft: {Number}, TotalShared: {Number}, TotalReceived: {Number}, ShowStarMap: {Boolean}}} response
       */
      response => {
        return new StaRHsStatus({
          cycleShared: response.YouHaveShared,
          cycleReceived: response.YouHaveReceived,
          cycleLeft: response.YouHaveLeft,
          totalShared: response.TotalShared,
          totalReceived: response.TotalReceived
        })
      }
    )
}

/**
 * @param {StaRHsAPIClient} apiClient
 */
export const staRHsStatusOperation = (apiClient) => ({
  post: staRHsStatus.bind(null, apiClient)
})
