'use strict'

/* global describe, it */

import {expect} from 'chai'
import {generateToken} from './token'
import profileHandler from '../../src/operations/profile'
import Promise from 'bluebird'
import {StaRHsAPIClient} from '../../src/apiclient'
import URIValue from 'rheactor-value-objects/uri'
import {Profile, StaRH, ProfileType} from 'starhs-models'
import {itShouldHaveLinkTo} from './helper'
const mountURL = new URIValue('https://api.example.com/')

describe('/profile', () => {
  it('should return the profile', () => {
    const mockClient = new StaRHsAPIClient('myapikey', 'apiuser', 'apipass')
    mockClient.getProfile = (sessionToken) => {
      expect(sessionToken).to.equal('some-session-token')
      return Promise.resolve({
        'PKUser': '9d1ecf8d-996e-4e5a-99e7-1a751157903a',
        'MapID': 0,
        'Kunde1': 'Resourceful Humans',
        'Kunde2': '',
        'Salutation': '',
        'Title': '',
        'Forename': '',
        'Name': 'Antarctica',
        'Function': null,
        'Telephone': '',
        'EMail': 'markus+antartica@rhway.net',
        'MobilePhone': '',
        'Profile': '',
        'UserID': 'antarctica',
        'InformByMail': true,
        'URLPicture': 'http://starhs.net/profileimgs/',
        'Timezone': 132,
        'UserCanInvite': false,
        'ShowStarMap': true,
        'Feature1': '',
        'Feature2': '',
        'Feature3': '',
        'Feature4': '',
        'Feature5': '',
        'Feature6': '',
        'Feature7': '',
        'Feature8': '',
        'Feature9': '',
        'Feature10': '',
        'FeatureName1': 'Abteilung',
        'FeatureName2': 'Geschlecht',
        'FeatureName3': 'Alter',
        'FeatureName4': '',
        'FeatureName5': '',
        'FeatureName6': '',
        'FeatureName7': '',
        'FeatureName8': '',
        'FeatureName9': '',
        'FeatureName10': ''
      })
    }
    const status = profileHandler(mountURL, mockClient)
    generateToken()
      .then(token => status.post({}, ['some-user-name'], token)
        .then(
          /**
           * @param {Profile} status
           */
          profile => {
            ProfileType(profile)
            expect(profile.email.toString()).to.equal('markus+antartica@rhway.net')
            expect(profile.firstname).to.equal('')
            expect(profile.lastname).to.equal('Antarctica')
            expect(profile.name).to.equal('Antarctica')
            expect(profile.avatar.toString()).to.equal('http://starhs.net/profileimgs/')
            expect(profile.$context.equals(new URIValue('https://github.com/ResourcefulHumans/staRHs-models#Profile'))).to.equal(true)
            // Validate links
            itShouldHaveLinkTo(profile, StaRH, true, 'received-staRHs')
            itShouldHaveLinkTo(profile, StaRH, true, 'shared-staRHs')
          }
        )
      )
  })
})
