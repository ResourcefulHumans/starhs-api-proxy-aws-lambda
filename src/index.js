import {StaRHsAPIClient} from './apiclient'
import config from './config'
import {handler as awsLambdaHandler, apiIndexOperation, statusOperation} from '@resourcefulhumans/rheactor-aws-lambda'
import {loginOperation} from './operations/login'
import {staRHsStatusOperation} from './operations/starhs-status'
import {profileOperation} from './operations/profile'
import {staRHsListOperation} from './operations/starhs-list'
import {colleagueListOperation} from './operations/colleagues-list'
import {newPasswordOperation} from './operations/new-password'
import {shareOperation} from './operations/share'
import {JsonWebToken, Status, Link, Index, User} from 'rheactor-models'
import {URIValue} from 'rheactor-value-objects'

const {key, user, password} = config.get('starhsapi')
const apiClient = new StaRHsAPIClient(key, user, password)
const mountURL = new URIValue(config.get('mount_url'))
const contentType = 'application/vnd.resourceful-humans.starhs.v1+json'
const tokenSecret = `${key}.${user}.${password}`
const version = config.get('version')
const environment = config.get('environment')
const deployTime = config.get('deploy_time')
const operations = {
  index: apiIndexOperation(new Index([
    new Link(mountURL.slashless().append('/status'), Status.$context),
    new Link(mountURL.slashless().append('/login'), JsonWebToken.$context),
    new Link(mountURL.slashless().append('/newPassword'), User.$context, false, 'newPassword')
  ])),
  login: loginOperation(mountURL, apiClient),
  staRHsStatus: staRHsStatusOperation(apiClient),
  staRHs: staRHsListOperation(mountURL, apiClient),
  share: shareOperation(mountURL, apiClient),
  profile: profileOperation(mountURL, apiClient),
  colleagues: colleagueListOperation(mountURL, apiClient),
  status: statusOperation(version, environment, deployTime),
  newPassword: newPasswordOperation(apiClient)
}

export const handler = awsLambdaHandler.bind(null, contentType, environment, tokenSecret, operations)
