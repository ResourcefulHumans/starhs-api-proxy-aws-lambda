import Promise from 'bluebird'
import {Status} from 'rheactor-models'
import config from '../config'

export const handler = {
  post: () => Promise.resolve(new Status('ok', new Date(), config.get('version') + '+' + config.get('environment') + '.' + config.get('deploy_time')))
}
