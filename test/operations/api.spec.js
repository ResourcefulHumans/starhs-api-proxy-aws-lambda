'use strict'

/* global describe, it */

const expect = require('chai').expect
const index = require('../../src/index')
const api = require('../../src/api')
const headers = {'Content-type': api.CONTENT_TYPE}
import {filter, head} from 'lodash/fp'
import {Status} from '../../src/operations/status'

describe('API', () => {
  describe('/', () => {
    it('should return the API index', done => {
      const path = '/'
      const httpMethod = 'GET'
      index
        .handler({
          headers,
          httpMethod,
          path
        }, null, (err, res) => {
          if (err) return done(err)
          expect(res.statusCode).to.equal(200)
          expect(res.headers).to.deep.equal({
            'Content-Type': api.CONTENT_TYPE
          })
          const body = JSON.parse(res.body)
          expect(body.$links.length).to.be.at.least(4)
          const statusLink = head(filter({$context: Status.$context.toString()})(body.$links))
          expect(statusLink.$context).to.equal(Status.$context.toString())
          done()
        })
    })
  })
  describe('/status', () => {
    it('should return status', done => {
      const path = '/status'
      const httpMethod = 'POST'
      index.handler({
        headers,
        httpMethod,
        path
      }, null, (err, res) => {
        expect(err).to.equal(null)
        expect(res.statusCode).to.equal(200)
        expect(res.headers).to.deep.equal({
          'Content-Type': api.CONTENT_TYPE
        })
        const body = JSON.parse(res.body)
        expect(body.status).to.equal('ok')
        expect(new Date(body.time).getTime()).to.be.most(Date.now())
        done()
      })
    })
  })
})
