/* global describe, it, before */

import {expect} from 'chai'
import {staRHmapOperation} from '../../src/operations/starh-map'
import Promise from 'bluebird'
import {StaRHsAPIClient} from '../../src/apiclient'
import {StaRHmapType} from 'starhs-models'
import {generateToken} from './token'
import {URIValue} from 'rheactor-value-objects'

describe('/staRHmap', () => {
  let mockClient
  before(() => {
    mockClient = new StaRHsAPIClient('myapikey', 'apiuser', 'apipass')
    mockClient.staRHmap = sessionToken => {
      expect(sessionToken).to.equal('some-session-token')
      return Promise.resolve({
        'nodes': [
          {
            'id': '1d70ff1a-d5c9-4edf-b383-35a0074462c3',
            'label': 'Angela Maus',
            'function': 'Partner',
            'Features': [
              {
                'Name': 'Abteilung',
                'Value': ''
              },
              {
                'Name': 'Geschlecht',
                'Value': ''
              },
              {
                'Name': 'Alter',
                'Value': ''
              }
            ]
          },
          {
            'id': '1b71e7a5-122b-489a-9def-e43cfba32adf',
            'label': 'Heiko Fischer',
            'function': 'Associate',
            'Features': [
              {
                'Name': 'Abteilung',
                'Value': 'Research and Development'
              },
              {
                'Name': 'Geschlecht',
                'Value': 'Männlich'
              },
              {
                'Name': 'Alter',
                'Value': '30 - 40'
              }
            ]
          },
          {
            'id': 'aba2f87b-f669-458b-b39b-a57e5728a459',
            'label': 'Senna Phillipa ',
            'function': '',
            'Features': [
              {
                'Name': 'Abteilung',
                'Value': null
              },
              {
                'Name': 'Geschlecht',
                'Value': null
              },
              {
                'Name': 'Alter',
                'Value': null
              }
            ]
          }
        ],
        'edges': [
          {
            'id': 'e0',
            'source': 'e4253fb9-fd29-43bf-b3aa-0555a931309e',
            'target': '1d70ff1a-d5c9-4edf-b383-35a0074462c3',
            'size': '1',
            'date': '2014-8-1T14:54:00'
          },
          {
            'id': 'e1',
            'source': 'e4253fb9-fd29-43bf-b3aa-0555a931309e',
            'target': '1d70ff1a-d5c9-4edf-b383-35a0074462c3',
            'size': '1',
            'date': '2015-1-29T14:19:00'
          },
          {
            'id': 'e1897',
            'source': '40179e5f-7f92-44a4-b6c6-f20d12da65db',
            'target': '1d70ff1a-d5c9-4edf-b383-35a0074462c3',
            'size': '5',
            'date': '2015-2-25T15:20:00'
          }
        ]
      })
    }
  })
  it('should return the staRHmap for the user', () => {
    const staRHmap = staRHmapOperation(mockClient)
    return generateToken()
      .then(token => staRHmap.post({start: new Date().toISOString(), end: new Date().toISOString()}, ['some-user-name'], token)
        .then(
          /**
           * @param {staRHmap} status
           */
          staRHmap => {
            StaRHmapType(staRHmap)
            expect(staRHmap.$context.equals(new URIValue('https://github.com/ResourcefulHumans/staRHs-models#StaRHmap'))).to.equal(true)
          }
        )
      )
  })
})
