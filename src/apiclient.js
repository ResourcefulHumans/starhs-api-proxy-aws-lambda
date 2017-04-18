/* global Buffer */

import rp from 'request-promise'
import moment from 'moment'
import {String as StringType, Date as DateType, Number as NumberType, irreducible, maybe, refinement} from 'tcomb'
import {URIValue, URIValueType} from 'rheactor-value-objects'
import fs from 'fs'
import Promise from 'bluebird'
import {v4} from 'uuid'
Promise.promisifyAll(fs)

const PositiveIntegerType = refinement(NumberType, n => n > 0 && n % 1 === 0, 'PositiveIntegerType')

const ENDPOINT = new URIValue('https://services.digital-bauhaus.solutions/RH-API/V0.94')

export class QueryOptions {
  /**
   * @param {{from: Date|undefined, to: Date|undefined, offset: Date|number|undefined, itemsPerPage: number|undefined}} opts
   */
  constructor (opts) {
    const {from, to, offset, itemsPerPage} = opts
    maybe(DateType)(from)
    maybe(DateType)(to)
    maybe(NumberType)(itemsPerPage)
    this.from = from
    this.to = to
    this.offset = offset
    this.itemsPerPage = itemsPerPage || 10
  }
}

export const QueryOptionsType = irreducible('QueryOptionsType', (x) => x instanceof QueryOptions)

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
  constructor (key, user, password, endpoint = ENDPOINT) {
    StringType(key)
    StringType(user)
    StringType(password)
    URIValueType(endpoint)
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

  updateProfile (sessionToken, profile) {
    StringType(sessionToken)
    return rp(
      {
        method: 'POST',
        uri: this.endpoint.slashless().toString() + '/profile/set-Profile',
        headers: {
          'SessionToken': sessionToken
        },
        qs: profile
      })
  }

  /**
   * NOTE: request-promise requires the file to a file read stream, that is why the file is first stored on disc.
   * NOTE: /tmp is hardcoded, because fs.mkdtemp is not available on Lambda
   *
   * @param {String} sessionToken
   * @param {String} pictureData binary data
   * @return Promise<Object>
   */
  updateAvatar (sessionToken, pictureData) {
    StringType(sessionToken)
    let tmpFile = `/tmp/avatar-upload-${v4()}`
    return fs.writeFileAsync(tmpFile, pictureData, 'binary')
      .then(() => rp(
        {
          method: 'POST',
          uri: this.endpoint.slashless().toString() + '/profile/set-ProfilePicture',
          headers: {
            'SessionToken': sessionToken
          },
          body: fs.createReadStream(tmpFile)
        }))
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
    URIValueType(endpoint)
    StringType(sessionToken)
    QueryOptionsType(opts)
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
        uri: endpoint.toString(),
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
    QueryOptionsType(opts)
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
    QueryOptionsType(opts)
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
      .then(() => {
        // response = '{ "Message": "StaRHs have been shared" }'
        return true
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
    QueryOptionsType(opts)
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
   * @link http://resourcefulhumans.github.io/staRHs-api/#map_get_MapDataWithSession_get
   * @param {String} sessionToken
   * @param {Date} start
   * @param {Date} end
   * @return Promise<Object>
   */
  staRHmap (sessionToken, start, end) {
    StringType(sessionToken)
    DateType(start)
    DateType(end)
    const self = this
    return rp(
      {
        method: 'GET',
        uri: self.endpoint.slashless().toString() + '/map/get-MapDataWithSession',
        headers: {
          'SessionToken': sessionToken
        },
        qs: {
          datefrom: start.toISOString().substr(0, 10),
          dateto: end.toISOString().substr(0, 10)
        },
        json: true
      })
  }
}

export const StaRHsAPIClientType = irreducible('StaRHsAPIClientType', (x) => x instanceof StaRHsAPIClient)
