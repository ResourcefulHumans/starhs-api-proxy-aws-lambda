import {JsonWebToken} from 'rheactor-models'
import jwt from 'jsonwebtoken'
import Promise from 'bluebird'

export function generateToken () {
  return Promise.try(() => jwt.sign(
    {
      SessionToken: 'some-session-token'
    },
    'myapikey.apiuser.apipass',
    {
      algorithm: 'HS256',
      issuer: 'login',
      subject: 'some-user-name',
      expiresIn: 60 * 60
    }))
    .then(token => new JsonWebToken(token))
}
