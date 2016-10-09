'use strict'

const rp = require('request-promise')
const ENDPOINT = 'https://services.digital-bauhaus.solutions/RH-API/V0.93'
const moment = require('moment')

/**
 * @param {String} key
 * @param {String} user
 * @param {String} password
 *
 * @constructor
 */
function StaRHsAPIClient (key, user, password) {
  this.key = key
  this.user = user
  this.password = password
}

/**
 * @link http://resourcefulhumans.github.io/staRHs-api/#session_get_LoginToken_get
 * @return {Promise.<String>}
 */
StaRHsAPIClient.prototype.getLoginToken = function () {
  let self = this
  return rp(
    {
      method: 'GET',
      uri: ENDPOINT + '/session/get-LoginToken',
      headers: {
        'APIKey': self.key,
        'APIUser': self.user,
        'APIPassword': self.password
      },
      json: true
    })
    .then((data) => {
      return data.LoginToken
    })
}

/**
 * @link http://resourcefulhumans.github.io/staRHs-api/#session_login_with_userid_post
 * @param {String} userId
 * @param {String} password
 * @return {Promise.<Object>}
 */
StaRHsAPIClient.prototype.loginWithUserId = function (userId, password) {
  let self = this

  return self.getLoginToken()
    .then((loginToken) => {
      return rp(
        {
          method: 'POST',
          uri: ENDPOINT + '/session/login-with-userid',
          headers: {
            'LoginToken': loginToken,
            'UserID': userId,
            'Password': password
          },
          json: true
        })
    })
}

/**
 * @link http://resourcefulhumans.github.io/staRHs-api/#profile_get_Profile_get
 * @param {String} sessionToken
 * @return {Promise.<Object>}
 */
StaRHsAPIClient.prototype.getProfile = function (sessionToken) {
  return rp(
    {
      method: 'GET',
      uri: ENDPOINT + '/profile/get-Profile',
      headers: {
        'SessionToken': sessionToken
      },
      json: true
    })
}

/**
 * @link http://resourcefulhumans.github.io/staRHs-api/#starhs_get_StarhsStatus_get
 * @param {String} sessionToken
 * @return {Promise.<Object>}
 */
StaRHsAPIClient.prototype.getStaRHsStatus = function (sessionToken) {
  return rp(
    {
      method: 'GET',
      uri: ENDPOINT + '/starhs/get-StarhsStatus',
      headers: {
        'SessionToken': sessionToken
      },
      json: true
    })
}

/**
 * @param {String} endpoint
 * @param {String} sessionToken
 * @param {object} opts
 * @return {Promise.<Object>}
 */
StaRHsAPIClient.prototype.getStaRHs = function (endpoint, sessionToken, opts) {
  const from = opts.from || new Date('2015-01-01')
  const to = opts.to || moment().endOf('day')
  const itemsPerPage = opts.itemsPerPage || 10
  const qs = {
    DateFrom: from.toISOString().slice(0, 10),
    DateFromTime: from.toISOString().slice(11, 19),
    DateTo: to.toISOString().slice(0, 10),
    DateToTime: to.toISOString().slice(11, 19),
    RecordCount: itemsPerPage
  }
  if (opts.offset) {
    qs.RecordStart = opts.offset.toISOString().slice(0, 10) + ' ' + opts.offset.toISOString().slice(11, 19)
  }
  return rp(
    {
      method: 'GET',
      uri: endpoint,
      headers: {
        'SessionToken': sessionToken
      },
      qs,
      json: true
    })
}

/**
 * @link http://resourcefulhumans.github.io/staRHs-api/#starhs_get_StarhsReceived_get
 * @param {String} sessionToken
 * @param {object} opts
 * @return {Promise.<Object>}
 */
StaRHsAPIClient.prototype.getStaRHsReceived = StaRHsAPIClient.prototype.getStaRHs.bind(null, ENDPOINT + '/starhs/get-StarhsReceived')

/**
 * @link http://resourcefulhumans.github.io/staRHs-api/#starhs_get_StarhsShared_get
 * @param {String} sessionToken
 * @param {object} opts
 * @return {Promise.<Object>}
 */
StaRHsAPIClient.prototype.getStaRHsShared = StaRHsAPIClient.prototype.getStaRHs.bind(null, ENDPOINT + '/starhs/get-StarhsShared')

/**
 * @link http://resourcefulhumans.github.io/staRHs-api/#starhs_share_Starh_get
 * @param {String} sessionToken
 * @param {String} to
 * @param {Number} amount
 * @param {String} message
 * @return {Promise.<Object>}
 */
StaRHsAPIClient.prototype.shareStaRH = function (sessionToken, to, amount, message) {
  const qs = {
    ToID: to,
    NoOfStaRHs: amount,
    Message: message
  }
  return rp(
    {
      method: 'GET',
      uri: ENDPOINT + '/starhs/share-Starh',
      headers: {
        'SessionToken': sessionToken
      },
      qs,
      json: true
    })
}

/**
 * @link http://resourcefulhumans.github.io/staRHs-api/#profile_get_ClientEmployees_get
 * @param {String} sessionToken
 * @param {object} opts
 * @return {Promise.<Object>}
 */
StaRHsAPIClient.prototype.getClientEmployees = function (sessionToken, opts) {
  const offset = opts.offset || 0
  const itemsPerPage = opts.itemsPerPage || 100
  const qs = {
    RecordCount: itemsPerPage
  }
  if (offset > 0) {
    qs.RecordStart = offset
  }
  return rp(
    {
      method: 'GET',
      uri: ENDPOINT + '/profile/get-ClientEmployees',
      headers: {
        'SessionToken': sessionToken
      },
      qs,
      json: true
    })
    .then(data => data.employees)
}

/**
 * Sends a new password to the user.
 *
 * @link http://resourcefulhumans.github.io/staRHs-api/#profile_get_PKUserFromUserID_get
 * @link http://resourcefulhumans.github.io/staRHs-api/#profile_get_new_password_get
 * @param userId
 * @return {Promise}
 */
StaRHsAPIClient.prototype.sendNewPassword = function (userId) {
  const self = this
  return rp({
    method: 'GET',
    uri: ENDPOINT + '/profile/get-PKUserFromUserID',
    headers: {
      'APIKey': self.key,
      'APIUser': self.user,
      'APIPassword': self.password,
      'UserID': userId
    },
    json: true
  })
    .then(data => {
      return rp({
        method: 'GET',
        uri: ENDPOINT + '/profile/get-new-password',
        headers: {
          'APIKey': self.key,
          'APIUser': self.user,
          'APIPassword': self.password,
          'PKUser': data.PKUser
        },
        json: true
      })
    })
}

/**
 * Sets a new profile picture
 *
 * @link http://resourcefulhumans.github.io/staRHs-api/#profile_set_ProfilePicture_post
 * @param {String} sessionToken
 * @param {String} imageData
 * @return {Promise}
 */
StaRHsAPIClient.prototype.setProfilePicture = function (sessionToken, imageData) {
  const imageDataBuffer = new Buffer(imageData)
  return rp({
    method: 'POST',
    uri: ENDPOINT + '/profile/set-ProfilePicture',
    headers: {
      'SessionToken': sessionToken
    },
    form: {
      Picture: imageDataBuffer.toString('base64')
    }
  })
}

module.exports = StaRHsAPIClient
