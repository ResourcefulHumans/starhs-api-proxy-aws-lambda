'use strict'

/* global describe, it */

const expect = require('chai').expect
const index = require('../../src/index')
const api = require('../../src/api')
const headers = {'Content-type': api.CONTENT_TYPE}

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
      expect(body.time).to.be.most(Date.now())
      done()
    })
  })
})
