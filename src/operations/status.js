'use strict'

import Promise from 'bluebird'
import {Status} from 'starhs-models'
import config from '../config'

export const handler = {
  post: () => Promise.resolve(new Status({
    status: 'ok',
    time: new Date(),
    version: config.get('version') + '+' + config.get('environment') + '.' + config.get('deploy_time')
  }))
}
