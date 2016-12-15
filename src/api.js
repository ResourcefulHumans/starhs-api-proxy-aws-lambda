'use strict'

const config = require('./config')
export const CONTENT_TYPE = config.get('mime_type') + '; charset=utf-8'
const _forIn = require('lodash/forIn')
const jwt = require('jsonwebtoken')
const JsonWebToken = require('rheactor-models/jsonwebtoken')
import Promise from 'bluebird'
const {key, user, password} = config.get('starhsapi')
import {irreducible, maybe, String as StringType, Boolean as BooleanType} from 'tcomb'
import URIValue from 'rheactor-value-objects/uri'

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

/**
 * @param {{headers: {Object}, path: {String}, httpMethod: {String}, body: {String}}} event
 * @returns {boolean}
 */
export function getOptionalToken (event) {
  const authorization = header(event.headers, 'Authorization')
  if (!authorization) return Promise.resolve()
  if (!/^Bearer /.test(authorization)) throw new Error(`Must provide bearer authorization!`)
  const token = authorization.match(/^Bearer (.+)/)[1]
  return new Promise((resolve, reject) => {
    return jwt.verify(token, key + '.' + user + '.' + password, (error) => {
      if (error) return reject(error)
      return resolve(new JsonWebToken(token))
    })
  })
}

export const JsonWebTokenType = irreducible('JsonWebTokenType', (x) => x instanceof JsonWebToken)

/**
 * @param {URIValue} url
 * @param {URIValue} context
 * @param {Boolean} list
 * @param {String|undefined} rel
 * @return {{href: string, $context: string, list: boolean|undefined, rel: string|undefined}}
 */
export const toLink = (url, context, list = false, rel) => {
  URIValue.Type(url)
  URIValue.Type(context)
  BooleanType(list)
  maybe(StringType)(rel)
  const u = url.toString()
  const l = {
    href: u,
    $context: context.toString()
  }
  if (list) l.list = true
  if (rel) l.rel = rel
  return l
}
