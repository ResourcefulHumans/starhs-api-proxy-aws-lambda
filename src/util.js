'use strict'

const _map = require('lodash/map')

const header = (headers, header) => {
  return _map(headers, header => header.toLower())[header]
}

module.exports = {
  header
}
