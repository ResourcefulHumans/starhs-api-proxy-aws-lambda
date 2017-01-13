/* global describe, it */

import {expect} from 'chai'
import {handler} from '../src/index'
import {CONTENT_TYPE} from '../src/api'
import {HttpProblem} from 'rheactor-models'
import {URIValue} from 'rheactor-value-objects'

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
      const expectedProblem = new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#Error'), 'Unknown operation "/some/operation"', 404)
      const body = JSON.parse(res.body)
      const sentProblem = HttpProblem.fromJSON(body)
      expect(sentProblem.name).to.equal(expectedProblem.name)
      expect(sentProblem.type.equals(expectedProblem.type)).to.equal(true)
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
      const expectedProblem = new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#Error'), 'Unsupported action "DELETE /status"', 400)
      const body = JSON.parse(res.body)
      const sentProblem = HttpProblem.fromJSON(body)
      expect(sentProblem.name).to.equal(expectedProblem.name)
      expect(sentProblem.type.equals(expectedProblem.type)).to.equal(true)
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
      const expectedProblem = new HttpProblem(new URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#SyntaxError'), 'Unexpected token b in JSON at position 1', 400)
      const body = JSON.parse(res.body)
      const sentProblem = HttpProblem.fromJSON(body)
      expect(sentProblem.name).to.equal(expectedProblem.name)
      expect(sentProblem.type.equals(expectedProblem.type)).to.equal(true)
      expect(sentProblem.title).to.equal(expectedProblem.title)
      expect(sentProblem.$context).to.equal(expectedProblem.$context)
      done()
    })
  })
})
