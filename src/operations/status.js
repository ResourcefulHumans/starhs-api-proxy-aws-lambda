'use strict'

const Promise = require('bluebird')

const status = () => Promise.resolve({
  status: 'ok',
  time: Date.now()
})

export default {
  post: status
}
