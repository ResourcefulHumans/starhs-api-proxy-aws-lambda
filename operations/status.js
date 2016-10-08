'use strict'

const status = () => {
  return {
    status: 'ok',
    time: Date.now()
  }
}

module.exports = {
  post: status
}
