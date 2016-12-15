'use strict'

import {JsonWebTokenType} from '../api'
import {StaRHsAPIClient} from '../apiclient'
import {Profile, StaRH} from 'starhs-models'
import URIValue from 'rheactor-value-objects/uri'
import EmailValue from 'rheactor-value-objects/email'
import {toLink} from '../api'

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @param {object} parts
 * @param {JsonWebToken} token
 * @returns {Promise.<Object>}
 */
const profile = (mountURL, apiClient, body, parts, token) => {
  StaRHsAPIClient.Type(apiClient)
  JsonWebTokenType(token)
  const username = parts[0]
  if (username !== token.sub) {
    throw new Error(`${username} is not you!`)
  }
  return apiClient.getProfile(token.payload.SessionToken)
    .then(
      /**
       * @param { { PKUser: {String}, MapID: {Number}, Kunde1: {String}, Kunde2: {String}, Salutation: {String}, Title: {String}, Forename: {String}, Name: {String}, Function: {String}, Telephone: {String}, EMail: {String}, MobilePhone: {String}, Profile: {String}, UserID: {String}, InformByMail: {Boolean}, URLPicture: {String}, Timezone: {Number}, UserCanInvite: {Boolean}, ShowStarMap: {Boolean}, Feature1: {String}, Feature2: {String}, Feature3: {String}, Feature4: {String}, Feature5: {String}, Feature6: {String}, Feature7: {String}, Feature8: {String}, Feature9: {String}, Feature10: {String}, FeatureName1: {String}, FeatureName2: {String}, FeatureName3: {String}, FeatureName4: {String}, FeatureName5: {String}, FeatureName6: {String}, FeatureName7: {String}, FeatureName8: {String}, FeatureName9: {String}, FeatureName10: {String} }
} response
       */
      response => {
        const profile = new Profile({
          email: new EmailValue(response.EMail),
          firstname: response.Forename,
          lastname: response.Name,
          avatar: response.URLPicture ? new URIValue(response.URLPicture) : undefined
        })
        profile.$links.push(toLink(new URIValue([mountURL.toString(), 'staRHs', username, 'shared'].join('/')), StaRH.$context, true, 'received-staRHs'))
        profile.$links.push(toLink(new URIValue([mountURL.toString(), 'staRHs', username, 'received'].join('/')), StaRH.$context, true, 'shared-staRHs'))
        return profile
      }
    )
}

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 */
export default (mountURL, apiClient) => {
  URIValue.Type(mountURL)
  return {
    post: profile.bind(null, mountURL.slashless(), apiClient)
  }
}
