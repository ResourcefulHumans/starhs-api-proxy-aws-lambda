'use strict'

import Promise from 'bluebird'
import {Status} from 'starhs-models'

export const handler = {
  post: () => Promise.resolve(new Status({
    status: 'ok',
    time: new Date()
  }))
}
