'use strict'

import {JsonWebTokenType} from '../api'
import {StaRHsAPIClient, QueryOptions} from '../apiclient'
import {StaRH, List, Link} from 'starhs-models'
import URIValue from 'rheactor-value-objects/uri'
import Joi from 'joi'
import profileHandler from './profile'
import staRHsStatusHandler from './starhs-status'
import HttpProblem from 'rheactor-models/http-problem'
import Promise from 'bluebird'
import {merge} from 'lodash'

/**
 * @param {URIValue} mountURL
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @param {object} parts
 * @param {JsonWebToken} token
 * @param {object} qs Query String Parameters
 * @returns {Promise.<Object>}
 */
const list = (mountURL, apiClient, body, parts, token, qs) => {
  URIValue.Type(mountURL)
  StaRHsAPIClient.Type(apiClient)
  JsonWebTokenType(token)
  const username = parts[0]
  if (username !== token.sub) {
    throw new Error(`${username} is not you!`)
  }
  const query = merge({}, qs)
  query.which = parts[1]
  const schema = Joi.object().keys({
    which: Joi.string().trim().required().allow(['received', 'shared']),
    offset: Joi.string()
  })
  const v = Joi.validate(query, schema, {convert: true})
  if (v.error) {
    throw new HttpProblem('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#ValidationFailed', v.error.toString(), 400, v.error)
  }

  const received = v.value.which === 'received'
  const m = received ? apiClient.getStaRHsReceived : apiClient.getStaRHsShared
  const opts = new QueryOptions({offset: v.value.offset ? new Date(v.value.offset) : undefined})

  return Promise.join(
    profileHandler(mountURL, apiClient).post({}, [username], token),
    staRHsStatusHandler(apiClient).post({}, [username], token),
    m.call(apiClient, token.payload.SessionToken, opts)
  )
    .spread(
      /**
       * @param {Profile} profile
       * @param {StaRHsStatus} status
       * @param {Array<{To: string, ToID: string, ToURLPicture: string, No: number, Reason: string, Date: string}>} staRHs
       */
      (profile, status, staRHs) => {
        const p = {name: profile.name, avatar: profile.avatar}
        const total = received ? status.totalReceived : status.totalShared
        const links = []
        let nextOffset
        if (staRHs.length) {
          nextOffset = (new Date(new Date(staRHs[staRHs.length - 1].Date).getTime() + 1)).toISOString()
          links.push(
            new Link(
              new URIValue([mountURL.toString(), 'staRHs', username, v.value.which].join('/') + '?offset=' + encodeURIComponent(nextOffset)),
              StaRH.$context,
              true,
              'next'
            )
          )
        }
        return new List(
          staRHs.map(starh => {
            const amount = starh.No
            const message = starh.Reason
            const to = received ? p : {
              name: starh.To,
              avatar: starh.ToURLPicture ? new URIValue(starh.ToURLPicture) : undefined
            }
            const from = received ? {
              name: starh.From,
              avatar: starh.FromURLPicture ? new URIValue(starh.FromURLPicture) : undefined
            } : p
            const $createdAt = new Date(starh.Date)
            return new StaRH({
              from,
              to,
              amount,
              message,
              $createdAt
            })
          }),
          total,
          opts.itemsPerPage,
          links
        )
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
    post: list.bind(null, mountURL.slashless(), apiClient)
  }
}
