'use strict'

// @flow

const config = require('./config')
export const CONTENT_TYPE = config.get('mime_type') + '; charset=utf-8'
const _forIn = require('lodash/forIn')
import type {ApiGatewayProxyEvent} from './index'

export function header (headers: ?{[id:string]: string}, header: string) {
  if (!headers || headers === null) return false
  const lowerCaseHeaders = {}
  _forIn(headers, (v, k) => {
    lowerCaseHeaders[k.toLowerCase()] = v
  })
  return lowerCaseHeaders[header.toLowerCase()]
}

export function checkContentType (event: ApiGatewayProxyEvent) {
  const ctype = header(event.headers, 'Content-Type')
  if (!ctype) {
    throw new Error('Must provide Content-Type.')
  }
  if (ctype !== CONTENT_TYPE) {
    throw new Error(`Unsupported content type: "${ctype}".`)
  }
  return true
}
