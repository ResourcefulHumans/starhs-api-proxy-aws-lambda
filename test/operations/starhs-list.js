'use strict'

/* global describe, it */

import {expect} from 'chai'
import {generateToken} from './token'
import staRHsListHandler from '../../src/operations/starhs-list'
import Promise from 'bluebird'
import {StaRHsAPIClient} from '../../src/apiclient'
import URIValue from 'rheactor-value-objects/uri'
import {ListType, StaRH} from 'starhs-models'
import {itShouldHaveLinkTo} from './helper'
const mountURL = new URIValue('https://api.example.com/')

describe('/staRHs/{user}/received', () => {
  it('should return the received staRHs', () => {
    const mockClient = new StaRHsAPIClient('myapikey', 'apiuser', 'apipass')
    mockClient.getStaRHsReceived = (sessionToken, opts) => {
      expect(sessionToken).to.equal('some-session-token')
      return Promise.resolve([
        {
          'From': 'Peter Gamelkoorn',
          'FromID': '1a1d56af-a34e-47e9-b590-309da51f60cc',
          'FromURLPicture': 'https://starhs.net/profileimgs/20c67c72-7c45-4de0-91e3-c2ac11c40b95.jpg',
          'No': 2,
          'Reason': 'staRH message 1',
          'Date': '2016-12-13T15:16:00'
        },
        {
          'From': 'Angela Maus',
          'FromID': '1d70ff1a-d5c9-4edf-b383-35a0074462c3',
          'FromURLPicture': 'https://starhs.net/profileimgs/05a08e72-eaa0-4ab3-8b52-61ca02860f2d.jpg',
          'No': 2,
          'Reason': 'staRH message 2',
          'Date': '2016-12-12T23:50:00'
        },
        {
          'From': 'Heiko Fischer',
          'FromID': '1b71e7a5-122b-489a-9def-e43cfba32adf',
          'FromURLPicture': 'https://starhs.net/profileimgs/8651161a-ac33-4837-9c33-87997ce7bdc1.jpg',
          'No': 2,
          'Reason': 'staRH message 3',
          'Date': '2016-12-12T19:57:00'
        }
      ])
    }
    mockClient.getProfile = (sessionToken) => {
      expect(sessionToken).to.equal('some-session-token')
      return Promise.resolve({
        'Forename': '',
        'Name': 'Antarctica',
        'EMail': 'antartica@example.com',
        'URLPicture': 'http://starhs.net/profileimgs/'
      })
    }
    mockClient.getStaRHsStatus = (sessionToken) => {
      expect(sessionToken).to.equal('some-session-token')
      return Promise.resolve({
        'CycleStaRHsToShare': 10,
        'YouHaveShared': 1,
        'YouHaveReceived': 2,
        'YouHaveLeft': 8,
        'TotalShared': 19,
        'TotalReceived': 11
      })
    }
    const list = staRHsListHandler(mountURL, mockClient)
    return generateToken()
      .then(token => list.post({}, ['some-user-name', 'received'], token)
        .then(
          /**
           * @param {List} list
           */
          list => {
            ListType(list)
            itShouldHaveLinkTo(list, StaRH, true, 'next')
            expect(list.total).to.equal(11)
            expect(list.itemsPerPage).to.equal(10)
            expect(list.hasNext).to.equal(true)
            expect(list.hasPrev).to.equal(false)
            expect(list.items.length).to.equal(3)
            expect(list.items[0]).to.be.instanceof(StaRH)
            expect(list.items[0].amount).to.equal(2)
            expect(list.items[0].message).to.equal('staRH message 1')
            expect(list.items[0].$createdAt.toISOString()).to.equal(new Date('2016-12-13T15:16:00').toISOString())
            expect(list.items[0].to).to.deep.equal({
              name: 'Antarctica',
              avatar: new URIValue('http://starhs.net/profileimgs/')
            })
            expect(list.items[0].from).to.deep.equal({
              name: 'Peter Gamelkoorn',
              avatar: new URIValue('https://starhs.net/profileimgs/20c67c72-7c45-4de0-91e3-c2ac11c40b95.jpg')
            })
          }
        )
      )
  })
})
