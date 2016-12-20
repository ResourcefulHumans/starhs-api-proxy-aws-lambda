'use strict'

/* global describe, it */

const expect = require('chai').expect
const index = require('../../src/index')
const api = require('../../src/api')
const headers = {'Content-type': api.CONTENT_TYPE}
import {filter, head} from 'lodash/fp'
import {Status} from 'starhs-models'
import Promise from 'bluebird'

describe('API', () => {
  describe('/index', () => {
    it('should return the API index', () => {
      const path = '/index'
      const httpMethod = 'GET'
      return new Promise(
        (resolve, reject) => {
          index
            .handler({
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
            'Content-Type': api.CONTENT_TYPE
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
          index.handler({
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
            'Content-Type': api.CONTENT_TYPE
          })
          const body = JSON.parse(res.body)
          expect(body.status).to.equal('ok')
          expect(new Date(body.time).getTime()).to.be.most(Date.now())
        })
    })
  })
})
