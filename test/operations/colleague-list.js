'use strict'

/* global describe, it */

import {expect} from 'chai'
import {generateToken} from './token'
import colleaguesListHandler from '../../src/operations/colleagues-list'
import Promise from 'bluebird'
import {StaRHsAPIClient} from '../../src/apiclient'
import URIValue from 'rheactor-value-objects/uri'
import EmailValue from 'rheactor-value-objects/email'
import {ListType, Profile} from 'starhs-models'
const mountURL = new URIValue('https://api.example.com/')

describe('/colleagues/{user}', () => {
  it('should return the colleagues of the user', () => {
    const mockClient = new StaRHsAPIClient('myapikey', 'apiuser', 'apipass')
    mockClient.getClientEmployees = (sessionToken, opts) => {
      expect(sessionToken).to.equal('some-session-token')
      return Promise.resolve([
        {
          'PKUser': '9d1ecf8d-996e-4e5a-99e7-1a751157903a',
          'MapID': 11929,
          'Salutation': '',
          'Title': '',
          'Forename': '',
          'Name': 'Antarctica',
          'Function': null,
          'Telephone': '',
          'EMail': 'antarctica@example.com',
          'MobilePhone': '',
          'Profile': '',
          'UserID': 'antarctica',
          'InformByMail': true,
          'URLPicture': 'https://starhs.net/profileimgs/'
        },
        {
          'PKUser': 'd0d93732-9de8-49d0-a20b-c139851c1eb8',
          'MapID': 3493,
          'Salutation': '',
          'Title': '',
          'Forename': 'Kathrin',
          'Name': 'B',
          'Function': null,
          'Telephone': '',
          'EMail': 'kathrin@example.com',
          'MobilePhone': '',
          'Profile': '',
          'UserID': 'Kathrin',
          'InformByMail': true,
          'URLPicture': 'https://starhs.net/profileimgs/f_Platzhalter-M.jpg'
        },
        {
          'PKUser': 'f7877bd9-836c-4ded-b10e-152dda2f6e78',
          'MapID': 1685,
          'Salutation': '',
          'Title': '',
          'Forename': 'Alexander',
          'Name': 'B',
          'Function': null,
          'Telephone': '',
          'EMail': 'alexander@example.com',
          'MobilePhone': '',
          'Profile': '',
          'UserID': 'Beitzi',
          'InformByMail': true,
          'URLPicture': 'https://starhs.net/profileimgs/f_Platzhalter-M.jpg'
        }
      ])
    }
    const list = colleaguesListHandler(mountURL, mockClient)
    return generateToken()
      .then(token => list.post({}, ['some-user-name'], token)
        .then(
          /**
           * @param {List} list
           */
          list => {
            ListType(list)
            expect(list.total).to.equal(Number.MAX_SAFE_INTEGER)
            expect(list.itemsPerPage).to.equal(Number.MAX_SAFE_INTEGER)
            expect(list.hasNext).to.equal(false)
            expect(list.hasPrev).to.equal(false)
            expect(list.items.length).to.equal(3)
            expect(list.items[0]).to.be.instanceof(Profile)
            expect(list.items[0].$id).to.equal('9d1ecf8d-996e-4e5a-99e7-1a751157903a')
            expect(list.items[0].email.equals(new EmailValue('antarctica@example.com'))).to.equal(true)
            expect(list.items[0].firstname).to.equal('')
            expect(list.items[0].lastname).to.equal('Antarctica')
            expect(list.items[0].avatar.equals(new URIValue('https://starhs.net/profileimgs/'))).to.equal(true)
            expect(list.items[1].firstname).to.equal('Kathrin')
            expect(list.items[1].lastname).to.equal('B')
          }
        )
      )
  })
})
