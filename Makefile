.DEFAULT_GOAL := help
.PHONY: help deploy update update-lambda-function update-lambda-env update-env-vars delete clean

AWS__REGION ?= "eu-central-1"
AWS__FUNCTION_NAME ?= "staRHsAPIproxy"
NODE_ENV ?= "production"
VERSION ?= $(shell /usr/bin/env node -e "console.log(require('./package.json').version);")

archive.zip: src/*.js src/**/*.js package.json
	rm -f $@
	rm -rf build
	./node_modules/.bin/babel src -d build
	cp package.json build
	cd build; npm install --production > /dev/null
	cd build; zip -r -q ../$@ ./

deploy: archive.zip ## Deploy to AWS lambda
	aws lambda create-function \
	--region $(AWS__REGION) \
	--function-name $(AWS__FUNCTION_NAME) \
	--zip-file fileb://$< \
	--role $(AWS__ROLE) \
	--timeout 60 \
	--handler index.handler \
	--runtime nodejs4.3

update-lambda-function: archive.zip ## Update the lambda function with new build
	aws lambda update-function-code \
	--region $(AWS__REGION) \
	--function-name $(AWS__FUNCTION_NAME) \
	--zip-file fileb://$<

update-lambda-env: guard-NODE_ENV guard-VERSION ## Update the lambda environment with version from environment variable and current time for deploy time
	aws lambda update-function-configuration \
	--function-name $(AWS__FUNCTION_NAME) \
	--region $(AWS__REGION) \
	--environment "Variables={$(shell make -s update-env-vars)}"

update-env-vars: guard-NODE_ENV guard-VERSION
	@aws lambda get-function-configuration \
	--function-name $(AWS__FUNCTION_NAME) \
	--region $(AWS__REGION) \
	| ./node_modules/.bin/babel-node ./node_modules/.bin/update-lambda-environment-config

delete: ## Deploy from AWS lambda
	aws lambda delete-function --region $(AWS__REGION) --function-name $(AWS__FUNCTION_NAME)

update: guard-NODE_ENV guard-VERSION ## Update the lambda
ifeq "${VERSION}" "0.0.0-development"
	@echo "Not deploying $(VERSION)!"
else
	make update-lambda-function
	NODE_ENV=$(NODE_ENV) VERSION=$(VERSION) make update-lambda-env
endif

# Helpers

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set"; \
		exit 1; \
	fi

clean: ## Clear up build artefacts
	rm -rf build
	rm archive.zip
