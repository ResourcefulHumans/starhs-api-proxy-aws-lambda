'use strict'

/* global describe, it */

import {expect} from 'chai'
import handler from '../../src/operations/apiindex'
import {Status} from '../../src/operations/status'
import URIValue from 'rheactor-value-objects/uri'

describe('apiindex', () => {
  it('should create a list of links', () => {
    handler(new URIValue('https://api.example.com/'), {
      'status': Status.$context
    }).get()
      .then(response => {
        expect(response.$links.length).to.equal(1)
        expect(response.$links[0].href).to.equal('https://api.example.com/status')
        expect(response.$links[0].$context).to.equal(Status.$context.toString())
      })
  })
})
