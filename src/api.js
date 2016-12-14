'use strict'

const config = require('./config')
export const CONTENT_TYPE = config.get('mime_type') + '; charset=utf-8'
const _forIn = require('lodash/forIn')

/**
 * @param {Array<String>} headers
 * @param {String} header
 * @returns {String}
 */
export function header (headers, header) {
  if (!headers || headers === null) return false
  const lowerCaseHeaders = {}
  _forIn(headers, (v, k) => {
    lowerCaseHeaders[k.toLowerCase()] = v
  })
  return lowerCaseHeaders[header.toLowerCase()]
}

/**
 * @param {{headers: {Object}, path: {String}, httpMethod: {String}, body: {String}}} event
 * @returns {boolean}
 */
export function checkContentType (event) {
  const ctype = header(event.headers, 'Content-Type')
  if (!ctype) {
    throw new Error('Must provide Content-Type.')
  }
  if (ctype.toLowerCase() !== CONTENT_TYPE.toLowerCase()) {
    throw new Error(`Unsupported content type: "${ctype}".`)
  }
  return true
}
