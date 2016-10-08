'use strict'

/* global describe, it */

const expect = require('chai').expect
const index = require('../index')
const api = require('../api')
const headers = {'Content-type': api.CONTENT_TYPE}

describe('index', () => {
  it('should send not found if operation does not exist', done => {
    const path = '/some/operation'
    index.handler({
      headers,
      path
    }, null, (err, res) => {
      expect(err).to.equal(null)
      expect(res.statusCode).to.equal(404)
      expect(res.headers).to.deep.equal({
        'Content-Type': api.CONTENT_TYPE
      })
      const expectedProblem = new api.HttpProblem('Error', 'Unknown operation "/some/operation"', 404)
      const body = JSON.parse(res.body)
      expect(body.name).to.equal(expectedProblem.name)
      expect(body.error).to.equal(expectedProblem.error)
      expect(body.title).to.equal(expectedProblem.title)
      expect(body.$context).to.equal(expectedProblem.$context)
      done()
    })
  })

  it('should send bad request if operation does not support method', done => {
    const path = '/status'
    const httpMethod = 'DELETE'
    const body = JSON.stringify({})
    index.handler({
      headers,
      httpMethod,
      path,
      body
    }, null, (err, res) => {
      expect(err).to.equal(null)
      expect(res.statusCode).to.equal(400)
      expect(res.headers).to.deep.equal({
        'Content-Type': api.CONTENT_TYPE
      })
      const expectedProblem = new api.HttpProblem('Error', 'Unsupported action "DELETE /status"', 400)
      const body = JSON.parse(res.body)
      expect(body.name).to.equal(expectedProblem.name)
      expect(body.error).to.equal(expectedProblem.error)
      expect(body.title).to.equal(expectedProblem.title)
      expect(body.$context).to.equal(expectedProblem.$context)
      done()
    })
  })
})
