# starhs-api-proxy-aws-lambda
  
[![Build Status](https://travis-ci.org/ResourcefulHumans/starhs-api-proxy-aws-lambda.svg?branch=master)](https://travis-ci.org/ResourcefulHumans/starhs-api-proxy-aws-lambda)
[![monitored by greenkeeper.io](https://img.shields.io/badge/greenkeeper.io-monitored-brightgreen.svg)](http://greenkeeper.io/) 
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![semantic-release](https://img.shields.io/badge/semver-semantic%20release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Test Coverage](https://codeclimate.com/github/ResourcefulHumans/starhs-api-proxy-aws-lambda/badges/coverage.svg)](https://codeclimate.com/github/ResourcefulHumans/starhs-api-proxy-aws-lambda/coverage)
[![Code Climate](https://codeclimate.com/github/ResourcefulHumans/starhs-api-proxy-aws-lambda/badges/gpa.svg)](https://codeclimate.com/github/ResourcefulHumans/starhs-api-proxy-aws-lambda)

[![NPM](https://nodei.co/npm/starhs-api-proxy-aws-lambda.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/starhs-api-proxy-aws-lambda/)

A proxy for the [staRHs API](https://github.com/ResourcefulHumans/staRHs-api) running on AWS lambda.

## Live

:earth_africa: <https://65isx1vpxe.execute-api.eu-central-1.amazonaws.com/prod>

This API is hosted as the [`staRHsAPIproxy`](https://eu-central-1.console.aws.amazon.com/lambda/home?region=eu-central-1#/functions/staRHsAPIproxy?tab=code) AWS Lambda function and the HTTP endpoint is provided via the [`staRHsAPI@prod`](https://eu-central-1.console.aws.amazon.com/apigateway/home?region=eu-central-1#/apis/65isx1vpxe/stages/prod) API Gateway stage. 

The Lambda function uses the role [`staRHsAPI`](https://console.aws.amazon.com/iam/home?region=eu-central-1#/roles/staRHsAPI).

These environment variables have been configured on the Lamba:

 * `MOUNT_URL=https://65isx1vpxe.execute-api.eu-central-1.amazonaws.com/prod`  
    This informations is needed for creating links to the services endpoints.
 * `STARHSAPI__KEY=*****`  
    API key to use, when connecting to the staRHs REST API
 * `STARHSAPI__PASSWORD=*****`  
    Password to use, when connecting to the staRHs REST API
 * `STARHSAPI__USER=staRHsWebApp`  
    Username to use, when connecting to the staRHs REST API

### Connected Services

The proxy connects to the [staRHs REST API provided by Digital Bauhaus](https://github.com/ResourcefulHumans/wiki/wiki/staRHs#rest-api).

The credentials for the REST API are provided by Digital Bauhaus.

### Deployment

:rocket: Deployment for this package is automated via [Travis CI](https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda/blob/master/.travis.yml).  
**Every commit can potentially trigger a deploy.**

If *lint* and *test* ran without error, [`semantic-release`](https://github.com/semantic-release/semantic-release) will be used to determine the next version for the package and that version string will be written to the `package.json`. After `semantic-release` has been run, [`make update`](https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda/blob/master/Makefile) will be executed to deploy a new release. 

If a new version has been released by `semantic-release`, `make update` will update the Lambda code. It uses these environment variables (which are [provided via Travis](https://travis-ci.org/ResourcefulHumans/starhs-api-proxy-aws-lambda/settings)):

 * `AWS__ROLE`  
   The role of the Lambda function
 * `AWS_ACCESS_KEY_ID`  
   The AWS access key to use
 * `AWS_SECRET_ACCESS_KEY`  
   The AWS secret access key to use

The AWS credentials for Travis are taken from the [`starhs@deploy`](https://console.aws.amazon.com/iam/home?region=eu-central-1#/users/starhs@deploy) user.
     
You can create new AWS keys via [IAM](https://console.aws.amazon.com/iam/home?region=eu-central-1). Assign the new user to the group [`staRHs`](https://console.aws.amazon.com/iam/home?region=eu-central-1#/groups/staRHs) which has the neccessary permission to update Lambda function.

