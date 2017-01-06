/* global process */

import {merge, forIn} from 'lodash'
import config from '../src/config'

let input = ''

process.stdin.setEncoding('utf8')

process.stdin.on('data', data => {
  input += data
})

process.stdin.on('end', () => {
  const env = merge(JSON.parse(input).Environment.Variables, {
    VERSION: config.get('version'),
    DEPLOY_TIME: config.get('deploy_time')
  })
  let vars = []
  forIn(env, (v, k) => {
    vars.push(`${k}="${v}"`)
  })
  process.stdout.write(vars.join(','))
})
