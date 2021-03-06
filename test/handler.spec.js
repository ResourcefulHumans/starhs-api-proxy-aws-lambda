/* global describe, it */

import {expect} from 'chai'
import {handler} from '../src'
import {Index, Status, User} from 'rheactor-models'
import {StaRHmap} from 'starhs-models'
const contentType = 'application/vnd.resourceful-humans.starhs.v1+json'
const headers = {'Content-type': contentType}

describe('handler', () => {
  describe('/index', () => {
    it('should return the list of operations', done => {
      handler({
        httpMethod: 'GET',
        headers,
        path: '/index'
      }, null, (err, res) => {
        expect(err).to.equal(null)
        expect(res.statusCode).to.equal(200)
        expect(res.headers['Content-Type']).to.equal(contentType)
        const index = Index.fromJSON(JSON.parse(res.body))
        expect(index.$links.length, 'Index should have 5 links').to.equal(5)
        expect(index.$links.filter(({subject}) => subject.equals(Status.$context)).length, 'Index should link to Status').to.equal(1)
        expect(index.$links.filter(({subject, rel}) => subject.equals(User.$context) && rel === 'newPassword').length, 'Index should link to Users\' newPassword relation').to.equal(1)
        expect(index.$links.filter(({subject, rel}) => subject.equals(User.$context) && rel === 'setNewPassword').length, 'Index should link to Users\' setNewPassword relation').to.equal(1)
        expect(index.$links.filter(({subject, rel}) => subject.equals(StaRHmap.$context)).length, 'Index should link to StaRHmap relation').to.equal(1)
        done()
      })
    })
  })

  describe('/status', () => {
    it('should return the status', done => {
      handler({
        httpMethod: 'POST',
        headers,
        path: '/status'
      }, null, (err, res) => {
        expect(err).to.equal(null)
        expect(res.statusCode).to.equal(200)
        expect(res.headers['Content-Type']).to.equal(contentType)
        const status = Status.fromJSON(JSON.parse(res.body))
        expect(status.status).to.equal('ok')
        expect(status.version).to.match(/^0\.0\.0\+testing\.[0-9]+$/)
        done()
      })
    })
  })
})
