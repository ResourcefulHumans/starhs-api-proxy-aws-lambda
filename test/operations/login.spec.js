'use strict'

/* global describe, it */

const expect = require('chai').expect
const Promise = require('bluebird')
const mockery = require('mockery')

describe('/login', () => {

  let index, api, headers

  before(() => {
    process.env.STARHSAPI__APIKEY = 'myapikey'
    process.env.STARHSAPI__USER = 'apiuser'
    process.env.STARHSAPI__PASSWORD = 'apipass'
    index = require('../../index')
    api = require('../../api')
    headers = {'Content-type': api.CONTENT_TYPE}

    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    })

    mockery.registerMock('request-promise', function () {
      var response = fs.readFileSync(__dirname + '/data/' + filename, 'utf8');
      return Promise.resolve(response.trim());
    })
  })

  after(() => {
    mockery.disable();
    mockery.deregisterAll();
  })

  it('should return a token', done => {
    const path = '/login'
    const httpMethod = 'POST'
    const body = JSON.stringify({
      username: 'someuser',
      password: 'somepass'
    })
    index.handler({
      headers,
      httpMethod,
      path,
      body
    }, null, (err, res) => {
      expect(err).to.equal(null)
      console.log(res)
      expect(res.statusCode).to.equal(200) // FIXME: Should be 201
      expect(res.headers).to.deep.equal({
        'Content-Type': api.CONTENT_TYPE
      })
      const body = JSON.parse(res.body)
      expect(body).to.equal('ok')
      done()
    })
  })
})
