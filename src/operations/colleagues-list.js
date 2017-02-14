import {StaRHsAPIClientType, QueryOptions} from '../apiclient'
import {Profile} from 'starhs-models'
import {URIValue, URIValueType, EmailValue} from 'rheactor-value-objects'
import Joi from 'joi'
import {List, Link, JsonWebTokenType} from 'rheactor-models'
import {joiErrorToHttpProblem} from '../util'

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
  URIValueType(mountURL)
  StaRHsAPIClientType(apiClient)
  JsonWebTokenType(token)
  const username = parts[0]
  if (username !== token.sub) {
    return Promise.reject(new Error(`${username} is not you!`))
  }
  const query = Object.assign({}, qs)
  const schema = Joi.object().keys({
    offset: Joi.number().min(0).default(0)
  })
  const v = Joi.validate(query, schema, {convert: true})
  if (v.error) {
    return Promise.reject(joiErrorToHttpProblem(v.error))
  }

  const opts = new QueryOptions({offset: v.value.offset, itemsPerPage: Number.MAX_SAFE_INTEGER}) // FIXME: https://github.com/ResourcefulHumans/staRHs/issues/24, pagination is impossible

  return apiClient.getClientEmployees(token.payload.SessionToken, opts)
    .then(
      /**
       * @param {Array<{To: string, ToID: string, ToURLPicture: string, No: number, Reason: string, Date: string}>} colleagues
       */
      (colleagues) => {
        const total = Number.MAX_SAFE_INTEGER
        const links = []
        let nextOffset
        if (colleagues.length === opts.itemsPerPage) {
          nextOffset = opts.offset + opts.itemsPerPage
          links.push(
            new Link(
              new URIValue([mountURL.toString(), 'colleagues', username].join('/') + '?offset=' + nextOffset),
              Profile.$context,
              true,
              'next'
            )
          )
        }
        return new List(
          colleagues.map(colleague => {
            return new Profile({
              $id: new URIValue(`${apiClient.endpoint}#profile:${colleague.PKUser}`),
              email: new EmailValue(colleague.EMail.replace(/\s/g, '')),
              firstname: colleague.Forename,
              lastname: colleague.Name,
              avatar: colleague.URLPicture ? new URIValue(colleague.URLPicture) : undefined
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
export const colleagueListOperation = (mountURL, apiClient) => {
  URIValueType(mountURL)
  return {
    post: list.bind(null, mountURL.slashless(), apiClient)
  }
}
