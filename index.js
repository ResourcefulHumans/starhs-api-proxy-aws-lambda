'use strict'

const Promise = require('bluebird')
const CONTENT_TYPE = 'application/vnd.resourceful-humans.starhs.v1+json; charset=utf-8'

exports.handler = (event, context, callback) => {
  let statusCode = 200
  const done = (err, res) => {
    if (err) console.error(err)
    return callback(null, {
      statusCode: err ? 400 : (res ? statusCode : 204),
      body: err ? err.message : JSON.stringify(res),
      headers: {
        'Content-Type': CONTENT_TYPE
      }
    })
  }

  Promise
    .try(() => {
      if (event.headers === null || !event.headers['Content-Type']) {
        throw new Error('Must provide Content-Type')
      }
      if (event.headers['Content-Type'] !== CONTENT_TYPE) {
        throw new Error('Unsupported content type: "' + event.headers['Content-Type'] + '"')
      }
      const parts = event.path.split('/')
      const body = JSON.parse(event.body)
      throw new Error(`Unsupported action "${event.httpMethod} ${event.path}"`)
    })
    .then(res => done(null, res))
    .catch(err => done(err))
}
