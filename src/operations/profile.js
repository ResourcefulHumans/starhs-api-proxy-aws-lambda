'use strict'

import {JsonWebTokenType} from '../api'
import {StaRHsAPIClient} from '../apiclient'
import {Profile} from 'starhs-models'
import URIValue from 'rheactor-value-objects/uri'
import EmailValue from 'rheactor-value-objects/email'
import {addLink} from '../api'

/**
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @param {object} parts
 * @param {JsonWebToken} token
 * @returns {Promise.<Object>}
 */
const profile = (apiClient, body, parts, token) => {
  StaRHsAPIClient.Type(apiClient)
  JsonWebTokenType(token)
  return apiClient.getProfile(token.payload.SessionToken)
    .then(
      /**
       * @param { { PKUser: {String}, MapID: {Number}, Kunde1: {String}, Kunde2: {String}, Salutation: {String}, Title: {String}, Forename: {String}, Name: {String}, Function: {String}, Telephone: {String}, EMail: {String}, MobilePhone: {String}, Profile: {String}, UserID: {String}, InformByMail: {Boolean}, URLPicture: {String}, Timezone: {Number}, UserCanInvite: {Boolean}, ShowStarMap: {Boolean}, Feature1: {String}, Feature2: {String}, Feature3: {String}, Feature4: {String}, Feature5: {String}, Feature6: {String}, Feature7: {String}, Feature8: {String}, Feature9: {String}, Feature10: {String}, FeatureName1: {String}, FeatureName2: {String}, FeatureName3: {String}, FeatureName4: {String}, FeatureName5: {String}, FeatureName6: {String}, FeatureName7: {String}, FeatureName8: {String}, FeatureName9: {String}, FeatureName10: {String} }
} response
       */
      response => {
        return new Profile({
          email: new EmailValue(response.EMail),
          firstname: response.Forename,
          lastname: response.Name,
          avatar: response.URLPicture ? new URIValue(response.URLPicture) : undefined
        })
      }
    )
}

/**
 * @param {StaRHsAPIClient} apiClient
 */
export default (apiClient) => ({
  post: profile.bind(null, apiClient)
})
