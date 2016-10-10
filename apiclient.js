'use strict'

// @flow

const rp = require('request-promise')
const ENDPOINT = 'https://services.digital-bauhaus.solutions/RH-API/V0.93'
const moment = require('moment')

export type queryOptions = {
  from:?Date,
  to:?Date,
  offset:any,
  itemsPerPage:number
}

/**
 * @type StaRHsAPIClient
 */
export class StaRHsAPIClient {
  key: string
  user: string
  password: string
  endpoint: string

  constructor (key: string, user: string, password: string, endpoint: ?string) {
    this.key = key
    this.user = user
    this.password = password
    this.endpoint = endpoint || ENDPOINT
  }

  /**
   * @link http://resourcefulhumans.github.io/staRHs-api/#session_get_LoginToken_get
   */
  getLoginToken (): Promise<string> {
    const self = this
    return rp(
      {
        method: 'GET',
        uri: self.endpoint + '/session/get-LoginToken',
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
   */
  loginWithUserId (userId: string, password: string): Promise<Object> {
    const self = this

    return self.getLoginToken()
      .then((loginToken) => {
        return rp(
          {
            method: 'POST',
            uri: self.endpoint + '/session/login-with-userid',
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
   */
  getProfile (sessionToken: string): Promise<Object> {
    const self = this
    return rp(
      {
        method: 'GET',
        uri: self.endpoint + '/profile/get-Profile',
        headers: {
          'SessionToken': sessionToken
        },
        json: true
      })
  }

  /**
   * @link http://resourcefulhumans.github.io/staRHs-api/#starhs_get_StarhsStatus_get
   */
  getStaRHsStatus (sessionToken: string): Promise<Object> {
    const self = this
    return rp(
      {
        method: 'GET',
        uri: self.endpoint + '/starhs/get-StarhsStatus',
        headers: {
          'SessionToken': sessionToken
        },
        json: true
      })
  }

  static _getStaRHs (endpoint: string, sessionToken: string, opts: queryOptions): Promise<Object> {
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
   */
  getStaRHsReceived (sessionToken: string, opts: queryOptions): Promise<Object> {
    const self = this
    return self.constructor._getStaRHs(self.endpoint + '/starhs/get-StarhsReceived', sessionToken, opts)
  }

  /**
   * @link http://resourcefulhumans.github.io/staRHs-api/#starhs_get_StarhsShared_get
   */
  getStaRHsShared (sessionToken: string, opts: queryOptions): Promise<Object> {
    const self = this
    return self.constructor._getStaRHs(self.endpoint + '/starhs/get-StarhsShared', sessionToken, opts)
  }

  /**
   * @link http://resourcefulhumans.github.io/staRHs-api/#starhs_share_Starh_get
   */
  shareStaRH (sessionToken: string, to: string, amount: number, message: string): Promise<Object> {
    const self = this
    const qs = {
      ToID: to,
      NoOfStaRHs: amount,
      Message: message
    }
    return rp(
      {
        method: 'GET',
        uri: self.endpoint + '/starhs/share-Starh',
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
   */
  getClientEmployees (sessionToken: string, opts: queryOptions): Promise<Object> {
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
        uri: self.endpoint + '/profile/get-ClientEmployees',
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
   */
  sendNewPassword (userId: string): Promise<Object> {
    const self = this
    return rp({
      method: 'GET',
      uri: self.endpoint + '/profile/get-PKUserFromUserID',
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
          uri: self.endpoint + '/profile/get-new-password',
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
   */
  setProfilePicture (sessionToken: string, imageData: string): Promise<Object> {
    const self = this
    const imageDataBuffer = new Buffer(imageData)
    return rp({
      method: 'POST',
      uri: self.endpoint + '/profile/set-ProfilePicture',
      headers: {
        'SessionToken': sessionToken
      },
      form: {
        Picture: imageDataBuffer.toString('base64')
      }
    })
  }
}
