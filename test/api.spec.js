'use strict'

/* global describe, it */

const expect = require('chai').expect
const api = require('../api')

describe('api', () => {
  describe('checkContentType()', () => {
    it('should return true if correct content-type is provided', () => {
      expect(api.checkContentType({headers: {'Content-type': api.CONTENT_TYPE}})).to.equal(true)
    })
    it('should throw an exception if no headers passed', () => {
      expect(() => {
        api.checkContentType({})
      }).to.throw('Must provide Content-Type.')
    })
    it('should throw an exception if wrong content-type passed', () => {
      expect(() => {
        api.checkContentType({headers: {'Content-Type': 'application/json'}})
      }).to.throw('Unsupported content type: "application/json".')
    })
  })
})
