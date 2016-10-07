'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const globAsync = Promise.promisify(require('glob'))
const AWS = require('aws-sdk')
const _memoize = require('lodash/memoize')
const _map = require('lodash/map')
const _filter = require('lodash/filter')

const prefix = process.env.AWS__LAMBDA_PREFIX
const archive = fs.readFileSync(path.join(__dirname, '/archive.zip'))
const region = process.env.AWS__REGION
const lambda = new AWS.Lambda({region})
const apiGateway = new AWS.APIGateway({region})

const operations = _memoize(() => globAsync(path.join(__dirname, '/operations/*.js'))
  .map(operationFile => operationFile.replace(path.join(__dirname, '/operations/'), '').replace(/\.[^\.]+$/, '')))

const installLambdaFunction = operation => {
  const FunctionName = prefix + '--' + operation
  const Handler = 'index.' + operation
  console.log(operation, '->', FunctionName, '(', Handler, ')')
  return Promise.promisify(lambda.getFunction, {context: lambda})({FunctionName})
    .then(lamdbaFunction => {
      console.log('Updating function', FunctionName)
      const params = {
        ZipFile: archive,
        FunctionName,
        Publish: true
      }
      return Promise.promisify(lambda.updateFunctionCode, {context: lambda})(params)
        .then(() => {
          console.log('Function updated:', FunctionName)
          return lamdbaFunction.Configuration
        })
    })
    .catch(err => err.name === 'ResourceNotFoundException', () => {
      console.log('Creating function', FunctionName)
      const params = {
        Code: {
          ZipFile: archive
        },
        FunctionName,
        Handler,
        Role: process.env.AWS__ROLE,
        Runtime: 'nodejs4.3',
        MemorySize: 128,
        Publish: true,
        Timeout: 60
      }
      return Promise.promisify(lambda.createFunction, {context: lambda})(params)
        .then(lamdbaFunction => {
          console.log('Function created:', FunctionName)
          return lamdbaFunction
        })
    })
}

const installRestApi = restApiName => Promise.resolve(Promise.promisify(apiGateway.getRestApis, {context: apiGateway})().then(apis => apis.items))
  .filter(restApi => restApi.name === restApiName)
  .spread(existingRestApi => {
    if (existingRestApi) return existingRestApi
    console.log('Creating Rest API', restApiName)
    return Promise
      .promisify(apiGateway.createRestApi, {context: apiGateway})({
        name: restApiName
      })
  })
  .then(restApi => restApi.id)

const getApiRootResource = restApiId => Promise
  .resolve(Promise.promisify(apiGateway.getResources, {context: apiGateway})({restApiId}).then(resources => resources.items))
  .filter(resource => resource.path === '/')
  .then(resources => resources[0])

const installResources = (restApiId, rootResource, lamdaFunctions) => {
  return Promise
    .join(
      Promise.resolve(Promise.promisify(apiGateway.getResources, {context: apiGateway})({restApiId}).then(resources => resources.items).map(resource => resource.path)),
      Promise.map(lamdaFunctions, lamdaFunction => '/' + lamdaFunction.operation)
    )
    // .spread((existingResources, requiredResources) => Promise.filter(requiredResources, requiredResource => existingResources.indexOf(requiredResource) < 0)
    .spread((existingResources, requiredResources) => Promise.map(requiredResources, requiredResource => requiredResource + '-' + Date.now())
      .map(resourceToBeCreated => {
        console.log('Creating resource', resourceToBeCreated)
        return Promise.promisify(apiGateway.createResource, {context: apiGateway})({restApiId, parentId: rootResource.id, pathPart: resourceToBeCreated.substr(1)})
          .then(resource => {
            const resourceId = resource.id
            console.log('Creating method')
            return Promise
              .promisify(apiGateway.putMethod, {context: apiGateway})({
                restApiId,
                resourceId,
                authorizationType: 'NONE',
                httpMethod: 'ANY',
                apiKeyRequired: true
              })
              .then(() => {
                  console.log('Creating integration')
                  resourceToBeCreated = resourceToBeCreated.split('-')[0]
                  const lambaArn = _filter(lamdaFunctions, lamdaFunction => lamdaFunction.operation === resourceToBeCreated.substr(1))[0].lamdbaFunction.FunctionArn
                  const uri = 'arn:aws:apigateway:' + region + ':lambda:path/2015-03-31/functions/' + lambaArn + '/invocations'
                  return Promise
                    .promisify(apiGateway.putIntegration, {context: apiGateway})({
                      restApiId,
                      resourceId,
                      httpMethod: 'ANY',
                      integrationHttpMethod: 'POST',
                      passthroughBehavior: 'WHEN_NO_MATCH',
                      type: 'AWS_PROXY',
                      uri
                    })
                }
              )
          })
      }))
}

const createDeployment = (restApiId, stageName) => {
  return Promise.promisify(apiGateway.createDeployment, {context: apiGateway})({restApiId, stageName, cacheClusterEnabled: false})
}

Promise.join(
  Promise.map(operations(), id => installLambdaFunction(id).then(lamdbaFunction => ({operation: id, lamdbaFunction}))),
  installRestApi(prefix).then(restApiId => getApiRootResource(restApiId).then(rootResource => ({restApiId, rootResource})))
)
  .spread((lamdaFunctions, apiInfo) => {
    return installResources(apiInfo.restApiId, apiInfo.rootResource, lamdaFunctions)
  })

