'use strict'

/* global describe, it */

import {expect} from 'chai'
import handler from '../../src/operations/apiindex'
import {Status} from 'starhs-models'
import URIValue from 'rheactor-value-objects/uri'

describe('apiindex', () => {
  it('should create a list of links', () => {
    return handler(new URIValue('https://api.example.com/'), {
      'status': Status.$context
    }).get()
      .then(response => {
        expect(response.$links.length).to.equal(1)
        expect(response.$links[0].href.equals(new URIValue('https://api.example.com/status'))).to.equal(true)
        expect(response.$links[0].subject.equals(Status.$context)).to.equal(true)
      })
  })
})
