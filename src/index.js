import {StaRHsAPIClient} from './apiclient'
import config from './config'
import {handler, apiIndexOperation, statusOperation} from '@resourcefulhumans/rheactor-aws-lambda'
import {handler as loginHandler} from './operations/login'
import staRHsStatusHandler from './operations/starhs-status'
import profileHandler from './operations/profile'
import staRHsListHandler from './operations/starhs-list'
import colleaguesListHandler from './operations/colleagues-list'
import shareHandler from './operations/share'
import {JsonWebToken, Status} from 'rheactor-models'
import {URIValue} from 'rheactor-value-objects'

const {key, user, password} = config.get('starhsapi')
const apiClient = new StaRHsAPIClient(key, user, password)
const mountURL = new URIValue(config.get('mount_url'))
const contentType = 'application/vnd.resourceful-humans.rheactor-aws-lambda.v1+json'
const tokenSecret = `${key}.${user}.${password}`
const version = config.get('version')
const environment = config.get('environment')
const deployTime = config.get('deploy_time')
const operations = {
  index: apiIndexOperation(mountURL, {
    'status': Status.$context,
    'login': JsonWebToken.$context
  }),
  login: loginHandler(mountURL, apiClient),
  staRHsStatus: staRHsStatusHandler(apiClient),
  staRHs: staRHsListHandler(mountURL, apiClient),
  share: shareHandler(mountURL, apiClient),
  profile: profileHandler(mountURL, apiClient),
  colleagues: colleaguesListHandler(mountURL, apiClient),
  status: statusOperation(version, environment, deployTime)
}

export default handler.bind(null, contentType, environment, tokenSecret, operations)
