import {StaRHsAPIClientType} from '../apiclient'
import {Profile, StaRH} from 'starhs-models'
import {JsonWebTokenType, Link} from 'rheactor-models'
import {EmailValue, URIValue, URIValueType} from 'rheactor-value-objects'

export const transformProfile = (apiClient, mountURL, username, response) => {
  const profile = new Profile({
    $id: new URIValue(`${mountURL}/profile/${response.PKUser}`),
    email: new EmailValue(response.EMail.replace(/\s/g, '')),
    firstname: response.Forename,
    lastname: response.Name,
    organization: response.Kunde1,
    avatar: response.URLPicture ? new URIValue(response.URLPicture) : undefined
  })
  profile.$links.push(new Link(new URIValue([mountURL.toString(), 'staRHs', username, 'shared'].join('/')), StaRH.$context, true, 'shared-staRHs'))
  profile.$links.push(new Link(new URIValue([mountURL.toString(), 'staRHs', username, 'received'].join('/')), StaRH.$context, true, 'received-staRHs'))
  profile.$links.push(new Link(new URIValue([mountURL.toString(), 'colleagues', username].join('/')), Profile.$context, true, 'colleagues'))
  profile.$links.push(new Link(new URIValue([mountURL.toString(), 'profileUpdate', username].join('/')), Profile.$context, false, 'update-profile'))
  profile.$links.push(new Link(new URIValue([mountURL.toString(), 'avatarUpdate', username].join('/')), Profile.$context, false, 'update-avatar'))
  profile.$links.push(new Link(new URIValue([mountURL.toString(), 'share'].join('/')), StaRH.$context, false, 'share-staRH'))
  return profile
}

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @param {object} parts
 * @param {JsonWebToken} token
 * @returns {Promise.<Object>}
 */
const profile = (mountURL, apiClient, body, parts, token) => {
  StaRHsAPIClientType(apiClient)
  JsonWebTokenType(token)
  const username = parts[0]
  return apiClient.getProfile(token.payload.SessionToken)
    .then(
      /**
       * @param { { PKUser: {String}, MapID: {Number}, Kunde1: {String}, Kunde2: {String}, Salutation: {String}, Title: {String}, Forename: {String}, Name: {String}, Function: {String}, Telephone: {String}, EMail: {String}, MobilePhone: {String}, Profile: {String}, UserID: {String}, InformByMail: {Boolean}, URLPicture: {String}, Timezone: {Number}, UserCanInvite: {Boolean}, ShowStarMap: {Boolean}, Feature1: {String}, Feature2: {String}, Feature3: {String}, Feature4: {String}, Feature5: {String}, Feature6: {String}, Feature7: {String}, Feature8: {String}, Feature9: {String}, Feature10: {String}, FeatureName1: {String}, FeatureName2: {String}, FeatureName3: {String}, FeatureName4: {String}, FeatureName5: {String}, FeatureName6: {String}, FeatureName7: {String}, FeatureName8: {String}, FeatureName9: {String}, FeatureName10: {String} }
} response
       */
      response => transformProfile(apiClient, mountURL, username, response)
    )
}

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 */
export const profileOperation = (mountURL, apiClient) => {
  URIValueType(mountURL)
  return {
    post: profile.bind(null, mountURL.slashless(), apiClient)
  }
}
