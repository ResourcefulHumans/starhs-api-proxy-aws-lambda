'use strict'

import rp from 'request-promise'
import moment from 'moment'
import {String as StringType, Date as DateType, Number as NumberType, irreducible, maybe, refinement} from 'tcomb'
import URIValue from 'rheactor-value-objects/uri'
const PositiveIntegerType = refinement(NumberType, n => n > 0 && n % 1 === 0, 'PositiveIntegerType')

const ENDPOINT = 'https://services.digital-bauhaus.solutions/RH-API/V0.93'

export class QueryOptions {
  /**
   * @param {Date} from
   * @param {Date} to
   * @param {object} offset
   * @param {Number} itemsPerPage
   */
  constructor (from, to, offset, itemsPerPage = 10) {
    maybe(DateType)(from)
    maybe(DateType)(to)
    maybe(NumberType)(itemsPerPage)
    this.from = from
    this.to = to
    this.offset = offset
    this.itemsPerPage = itemsPerPage
  }
}

QueryOptions.Type = irreducible('QueryOptionsType', (x) => x instanceof QueryOptions)

/**
 * @type StaRHsAPIClient
 */
export class StaRHsAPIClient {
  /**
   * @param {String} key
   * @param {String} user
   * @param {String} password
   * @param {URIValue} endpoint
   */
  constructor (key, user, password, endpoint = new URIValue(ENDPOINT)) {
    StringType(key)
    StringType(user)
    StringType(password)
    URIValue.Type(endpoint)
    this.key = key
    this.user = user
    this.password = password
    this.endpoint = endpoint
  }

  /**
   * @link http://resourcefulhumans.github.io/staRHs-api/#session_get_LoginToken_get
   * @return Promise<String>
   */
  getLoginToken () {
    const self = this
    return rp(
      {
        method: 'GET',
        uri: self.endpoint.slashless().toString() + '/session/get-LoginToken',
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
   * @return Promise<Object>
   */
  loginWithUserId (userId, password) {
    StringType(userId)
    StringType(password)
    const self = this
    return self.getLoginToken()
      .then((loginToken) => {
        return rp(
          {
            method: 'POST',
            uri: self.endpoint.slashless().toString() + '/session/login-with-userid',
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
   * @return Promise<Object>
   */
  getProfile (sessionToken) {
    StringType(sessionToken)
    const self = this
    return rp(
      {
        method: 'GET',
        uri: self.endpoint.slashless().toString() + '/profile/get-Profile',
        headers: {
          'SessionToken': sessionToken
        },
        json: true
      })
  }

  /**
   * @link http://resourcefulhumans.github.io/staRHs-api/#starhs_get_StarhsStatus_get
   * @param {String} sessionToken
   * @return Promise<Object>
   */
  getStaRHsStatus (sessionToken) {
    StringType(sessionToken)
    const self = this
    return rp(
      {
        method: 'GET',
        uri: self.endpoint.slashless().toString() + '/starhs/get-StarhsStatus',
        headers: {
          'SessionToken': sessionToken
        },
        json: true
      })
  }

  /**
   * @param {URIValue} endpoint
   * @param {String} sessionToken
   * @param {QueryOptions} opts
   * @return Promise<Object>
   * @private
   */
  static _getStaRHs (endpoint, sessionToken, opts) {
    URIValue.Type(endpoint)
    StringType(sessionToken)
    QueryOptions.Type(opts)
    const from = opts.from || new Date('2015-01-01')
    const to = opts.to || moment().endOf('day')
    const itemsPerPage = opts.itemsPerPage || 10
    const qs = {
      DateFrom: from.toISOString().slice(0, 10),
      DateFromTime: from.toISOString().slice(11, 19),
      DateTo: to.toISOString().slice(0, 10),
      DateToTime: to.toISOString().slice(11, 19),
      RecordCount: itemsPerPage,
      RecordStart: undefined
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
   * @param {QueryOptions} opts
   * @return Promise<Object>
   */
  getStaRHsReceived (sessionToken, opts) {
    StringType(sessionToken)
    QueryOptions.Type(opts)
    const self = this
    return self.constructor._getStaRHs(new URIValue(self.endpoint.slashless().toString() + '/starhs/get-StarhsReceived'), sessionToken, opts)
  }

  /**
   * @link http://resourcefulhumans.github.io/staRHs-api/#starhs_get_StarhsShared_get
   * @param {String} sessionToken
   * @param {QueryOptions} opts
   * @return Promise<Object>
   */
  getStaRHsShared (sessionToken, opts) {
    StringType(sessionToken)
    QueryOptions.Type(opts)
    const self = this
    return self.constructor._getStaRHs(new URIValue(self.endpoint.slashless().toString() + '/starhs/get-StarhsShared'), sessionToken, opts)
  }

  /**
   * @link http://resourcefulhumans.github.io/staRHs-api/#starhs_share_Starh_get
   * @param {String} sessionToken
   * @param {String} to
   * @param {Number} amount
   * @param {String} message
   * @return Promise<Object>
   */
  shareStaRH (sessionToken, to, amount, message) {
    StringType(sessionToken)
    StringType(to)
    PositiveIntegerType(amount)
    StringType(message)
    const self = this
    const qs = {
      ToID: to,
      NoOfStaRHs: amount,
      Message: message
    }
    return rp(
      {
        method: 'GET',
        uri: self.endpoint.slashless().toString() + '/starhs/share-Starh',
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
   * @param {QueryOptions} opts
   * @return Promise<Object>
   */
  getClientEmployees (sessionToken, opts) {
    StringType(sessionToken)
    QueryOptions.Type(opts)
    const self = this
    const offset = opts.offset || 0
    const itemsPerPage = opts.itemsPerPage || 100
    const qs = {
      RecordCount: itemsPerPage,
      RecordStart: undefined
    }
    if (offset > 0) {
      qs.RecordStart = offset
    }
    return rp(
      {
        method: 'GET',
        uri: self.endpoint.slashless().toString() + '/profile/get-ClientEmployees',
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
   * @param {String} userId
   * @return Promise<Object>
   */
  sendNewPassword (userId) {
    StringType(userId)
    const self = this
    return rp({
      method: 'GET',
      uri: self.endpoint.slashless().toString() + '/profile/get-PKUserFromUserID',
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
          uri: self.endpoint.slashless().toString() + '/profile/get-new-password',
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
   * @param {String} userId
   * @return Promise<Object>
   */
  setProfilePicture (sessionToken, imageData) {
    StringType(sessionToken)
    StringType(imageData)
    const self = this
    const imageDataBuffer = new Buffer(imageData)
    return rp({
      method: 'POST',
      uri: self.endpoint.slashless().toString() + '/profile/set-ProfilePicture',
      headers: {
        'SessionToken': sessionToken
      },
      form: {
        Picture: imageDataBuffer.toString('base64')
      }
    })
  }
}

StaRHsAPIClient.Type = irreducible('StaRHsAPIClientType', (x) => x instanceof StaRHsAPIClient)