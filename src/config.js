'use strict'

const nconf = require('nconf')
const defaultEnvironment = 'production'
const env = process.env.NODE_ENV || defaultEnvironment

nconf.use('memory')

nconf
  .env({
    whitelist: [
      'starhsapi__key',
      'starhsapi__user',
      'starhsapi__password'
    ],
    lowerCase: true,
    separator: '__'
  })

nconf.defaults({
  'environment': env,
  'mime_type': 'application/vnd.resourceful-humans.starhs.v1+json',
  'starhsapi': {
    'key': 'myapikey',
    'user': 'apiuser',
    'password': 'apipass'
  }
})

module.exports = nconf
