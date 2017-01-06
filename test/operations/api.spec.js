/* global describe, it */

import {expect} from 'chai'
import {handler} from '../../src/index'
import {CONTENT_TYPE} from '../../src/api'
import {filter, head} from 'lodash/fp'
import {Status} from 'rheactor-models'
import Promise from 'bluebird'
const headers = {'Content-type': CONTENT_TYPE}

describe('API', () => {
  describe('/index', () => {
    it('should return the API index', () => {
      const path = '/index'
      const httpMethod = 'GET'
      return new Promise(
        (resolve, reject) => {
          handler({
            headers,
            httpMethod,
            path
          }, null, (err, res) => {
            if (err) return reject(err)
            return resolve(res)
          })
        })
        .then(res => {
          expect(res.statusCode).to.equal(200)
          expect(res.headers).to.deep.equal({
            'Content-Type': CONTENT_TYPE,
            'Access-Control-Allow-Origin': '*'
          })
          const body = JSON.parse(res.body)
          expect(body.$links.length).to.be.at.least(2)
          const statusLink = head(filter({subject: Status.$context.toString()})(body.$links))
          expect(statusLink.subject).to.equal(Status.$context.toString())
        })
    })
  })
  describe('/status', () => {
    it('should return status', () => {
      const path = '/status'
      const httpMethod = 'POST'
      return new Promise(
        (resolve, reject) => {
          handler({
            headers,
            httpMethod,
            path
          }, null, (err, res) => {
            if (err) return reject(err)
            return resolve(res)
          })
        })
        .then(res => {
          expect(res.statusCode).to.equal(200)
          expect(res.headers).to.deep.equal({
            'Content-Type': CONTENT_TYPE,
            'Access-Control-Allow-Origin': '*'
          })
          const body = JSON.parse(res.body)
          expect(body.status).to.equal('ok')
          expect(body.version).to.match(/^0\.0\.0\+testing\.[0-9]+/)
          expect(new Date(body.time).getTime()).to.be.most(Date.now())
        })
    })
  })
})
