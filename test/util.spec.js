/* global describe, it */

import {joiErrorToHttpProblem} from '../src/util'
import {expect} from 'chai'
import Joi from 'joi'
import {HttpProblem} from 'rheactor-models'

describe('util', () => {
  describe('joiErrorToHttpProblem', () => {
    it('should convert a JOI error to a HTTP Problem', () => {
      const schema = Joi.object().keys({
        offset: Joi.number().min(0).default(0)
      })
      const v = Joi.validate({offset: 'foo'}, schema)
      let httpProblem = joiErrorToHttpProblem(v.error)
      expect(HttpProblem.is(httpProblem)).to.equal(true)
    })
  })
})
