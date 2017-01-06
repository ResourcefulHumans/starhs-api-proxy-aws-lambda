/* global describe, it */

import {expect} from 'chai'
import {handler} from '../src/index'
import {CONTENT_TYPE} from '../src/api'
import {HttpProblem} from 'rheactor-models'

const headers = {'Content-type': CONTENT_TYPE}

describe('index', () => {
  it('should send not found if operation does not exist', done => {
    const path = '/some/operation'
    handler({
      headers,
      path
    }, null, (err, res) => {
      expect(err).to.equal(null)
      expect(res.statusCode).to.equal(404)
      expect(res.headers).to.deep.equal({
        'Content-Type': CONTENT_TYPE,
        'Access-Control-Allow-Origin': '*'
      })
      const expectedProblem = new HttpProblem('Error', 'Unknown operation "/some/operation"', 404)
      const body = JSON.parse(res.body)
      const sentProblem = HttpProblem.fromJSON(body)
      expect(sentProblem.name).to.equal(expectedProblem.name)
      expect(sentProblem.error).to.equal(expectedProblem.error)
      expect(sentProblem.title).to.equal(expectedProblem.title)
      expect(sentProblem.$context).to.equal(expectedProblem.$context)
      done()
    })
  })

  it('should send bad request if operation does not support method', done => {
    const path = '/status'
    const httpMethod = 'DELETE'
    const body = JSON.stringify({})
    handler({
      headers,
      httpMethod,
      path,
      body
    }, null, (err, res) => {
      expect(err).to.equal(null)
      expect(res.statusCode).to.equal(400)
      expect(res.headers).to.deep.equal({
        'Content-Type': CONTENT_TYPE,
        'Access-Control-Allow-Origin': '*'
      })
      const expectedProblem = new HttpProblem('Error', 'Unsupported action "DELETE /status"', 400)
      const body = JSON.parse(res.body)
      const sentProblem = HttpProblem.fromJSON(body)
      expect(sentProblem.name).to.equal(expectedProblem.name)
      expect(sentProblem.error).to.equal(expectedProblem.error)
      expect(sentProblem.title).to.equal(expectedProblem.title)
      expect(sentProblem.$context).to.equal(expectedProblem.$context)
      done()
    })
  })

  it('should send bad request if bad body provided', done => {
    const path = '/status'
    const httpMethod = 'POST'
    const body = '{bad json'
    handler({
      headers,
      httpMethod,
      path,
      body
    }, null, (err, res) => {
      expect(err).to.equal(null)
      expect(res.statusCode).to.equal(400)
      expect(res.headers).to.deep.equal({
        'Content-Type': CONTENT_TYPE,
        'Access-Control-Allow-Origin': '*'
      })
      const expectedProblem = new HttpProblem('Error', 'Unexpected token b in JSON at position 1', 400)
      const body = JSON.parse(res.body)
      const sentProblem = HttpProblem.fromJSON(body)
      expect(sentProblem.name).to.equal(expectedProblem.name)
      expect(sentProblem.error).to.equal(expectedProblem.error)
      expect(sentProblem.title).to.equal(expectedProblem.title)
      expect(sentProblem.$context).to.equal(expectedProblem.$context)
      done()
    })
  })
})
