import {JsonWebTokenType} from 'rheactor-models'
import {StaRHsAPIClientType} from '../apiclient'
import {StaRHmap} from 'starhs-models'
import Joi from 'joi'
import {joiErrorToHttpProblem} from '../util'

/**
 * @param {StaRHsAPIClient} apiClient
 * @param {object} body
 * @param {object} parts
 * @param {JsonWebToken} token
 * @returns {Promise.<Object>}
 */
const staRHmap = (apiClient, body, parts, token) => {
  StaRHsAPIClientType(apiClient)
  JsonWebTokenType(token)
  const schema = Joi.object().keys({
    start: Joi.date().required(),
    end: Joi.date().required()
  })
  const v = Joi.validate(body, schema, {convert: true})
  if (v.error) {
    return Promise.reject(joiErrorToHttpProblem(v.error))
  }
  return apiClient.staRHmap(token.payload.SessionToken, v.value.start, v.value.end)
    .then(
      /**
       * @param {{nodes: Array.<{id: String, label: String, function: String, Features: Array<{Name: String, Value: String|null}> }>, edges: Array.<{id: String, source: String, target: String, size: String, date: String}>} response
       */
      response => {
        return new StaRHmap({
          nodes: response.nodes.map(node => {
            let label = node.label.trim()
            if (!label.length) label = undefined
            let role = node.function
            if (!role.length) role = undefined
            let features
            node.Features.map(feature => {
              const value = (feature.Value || '').trim()
              if (feature.Value === null || value.length === 0) return
              if (!features) features = {}
              features[feature.Name] = value
            })
            return {
              id: node.id,
              label,
              role,
              features
            }
          }),
          edges: response.edges.map(edge => Object.assign(edge, {size: +edge.size}))
        })
      }
    )
}

/**
 * @param {StaRHsAPIClient} apiClient
 */
export const staRHmapOperation = (apiClient) => ({
  post: staRHmap.bind(null, apiClient)
})
