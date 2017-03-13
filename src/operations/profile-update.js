import {StaRHsAPIClientType} from '../apiclient'
import {Profile} from 'starhs-models'
import {JsonWebTokenType} from 'rheactor-models'
import {URIValueType} from 'rheactor-value-objects'
import {transformProfile} from './profile'

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @param {object} parts
 * @param {JsonWebToken} token
 * @returns {Promise.<Object>}
 */
const profileUpdate = (mountURL, apiClient, body, parts, token) => {
  StaRHsAPIClientType(apiClient)
  JsonWebTokenType(token)
  const username = parts[0]
  return apiClient.getProfile(token.payload.SessionToken)
    .then(response => {
      const profile = transformProfile(apiClient, mountURL, username, response)
      const updatedProfile = Profile.fromJSON(Object.assign({}, profile.toJSON(), body))
      return apiClient
        .updateProfile(token.payload.SessionToken, {
          Salutation: response.Salutation,
          Title: response.Title,
          Forename: updatedProfile.firstname,
          Name: updatedProfile.lastname,
          Telephone: response.Telephone,
          EMail: updatedProfile.email.toString(),
          MobilePhone: response.MobilePhone,
          Profile: response.Profile,
          InformByMail: response.InformByMail,
          Feature1: response.Feature1,
          Feature2: response.Feature2,
          Feature3: response.Feature3,
          Feature4: response.Feature4,
          Feature5: response.Feature5,
          Feature6: response.Feature6,
          Feature7: response.Feature7,
          Feature8: response.Feature8,
          Feature9: response.Feature9,
          Feature10: response.Feature10
        })
        .then(() => '')
    })
}

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 */
export const profileUpdateOperation = (mountURL, apiClient) => {
  URIValueType(mountURL)
  return {
    post: profileUpdate.bind(null, mountURL.slashless(), apiClient)
  }
}
