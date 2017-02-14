import {StaRHsAPIClient} from './apiclient'
import config from './config'
import {handler, apiIndexOperation, statusOperation} from '@resourcefulhumans/rheactor-aws-lambda'
import {loginOperation} from './operations/login'
import {staRHsStatusOperation} from './operations/starhs-status'
import {profileOperation} from './operations/profile'
import {staRHsListOperation} from './operations/starhs-list'
import {colleagueListOperation} from './operations/colleagues-list'
import {shareOperation} from './operations/share'
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
  login: loginOperation(mountURL, apiClient),
  staRHsStatus: staRHsStatusOperation(apiClient),
  staRHs: staRHsListOperation(mountURL, apiClient),
  share: shareOperation(mountURL, apiClient),
  profile: profileOperation(mountURL, apiClient),
  colleagues: colleagueListOperation(mountURL, apiClient),
  status: statusOperation(version, environment, deployTime)
}

export default handler.bind(null, contentType, environment, tokenSecret, operations)
