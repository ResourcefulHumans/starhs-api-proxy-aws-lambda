/* global describe, it */

import {expect} from 'chai'
import {generateToken} from './token'
import {profileUpdateOperation} from '../../src/operations/profile-update'
import Promise from 'bluebird'
import {StaRHsAPIClient} from '../../src/apiclient'
import {URIValue} from 'rheactor-value-objects'
import {mockProfileData} from './profile.spec'
const mountURL = new URIValue('https://api.example.com/')

describe('/profileUpdate', () => {
  it('should update the profile', done => {
    const mockClient = new StaRHsAPIClient('myapikey', 'apiuser', 'apipass')
    mockClient.getProfile = sessionToken => {
      expect(sessionToken).to.equal('some-session-token')
      return Promise.resolve(mockProfileData)
    }
    mockClient.updateProfile = (sessionToken, profileData) => {
      expect(sessionToken).to.equal('some-session-token')
      expect(profileData).to.deep.equal({
        'Salutation': '',
        'Title': '',
        'Forename': 'Ant',
        'Name': 'Arctica',
        'Telephone': '',
        'EMail': 'antartica2@example.com',
        'MobilePhone': '',
        'Profile': '',
        'InformByMail': true,
        'Feature1': '',
        'Feature2': '',
        'Feature3': '',
        'Feature4': '',
        'Feature5': '',
        'Feature6': '',
        'Feature7': '',
        'Feature8': '',
        'Feature9': '',
        'Feature10': ''
      })
      done()
      return Promise.resolve({'Message': 'Userdata has been updated'})
    }
    const op = profileUpdateOperation(mountURL, mockClient)
    generateToken()
      .then(token => op.post({email: 'antartica2@example.com', firstname: 'Ant', lastname: 'Arctica'}, ['some-user-name'], token))
  })
})
