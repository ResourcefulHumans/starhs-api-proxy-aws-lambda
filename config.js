'use strict'

// @flow

const nconf = require('nconf')
const path = require('path')
const defaultEnvironment = 'production'
const env = process.env.NODE_ENV || defaultEnvironment

nconf.use('memory')
nconf.file({file: path.normalize(path.join(__dirname, 'config.' + env + '.json'))})
nconf.defaults({
  'environment': env,
  'mime_type': 'application/vnd.resourceful-humans.starhs.v1+json'
})

module.exports = nconf
