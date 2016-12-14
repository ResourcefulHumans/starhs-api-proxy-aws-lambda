.DEFAULT_GOAL := help
.PHONY: help deploy update delete clean

AWS__REGION ?= "eu-central-1"
AWS__FUNCTION_NAME ?= "staRHsAPIproxy"

archive.zip: src/*.js src/**/*.js
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
	--environment "Variables={STARHSAPI__KEY=$(STARHSAPI__KEY),STARHSAPI__USER=$(STARHSAPI__USER),STARHSAPI__PASSWORD=$(STARHSAPI__PASSWORD)}" \
	--runtime nodejs4.3

update: archive.zip ## Update the lambda function with new build
	aws lambda update-function-code \
	--region $(AWS__REGION) \
	--function-name $(AWS__FUNCTION_NAME) \
	--zip-file fileb://$<

update-environment: guard-STARHSAPI__KEY guard-STARHSAPI__USER guard-STARHSAPI__PASSWORD ## update the environment variables
	aws lambda update-function-configuration \
  --function-name $(AWS__FUNCTION_NAME) \
  --environment "Variables={STARHSAPI__KEY=$(STARHSAPI__KEY),STARHSAPI__USER=$(STARHSAPI__USER),STARHSAPI__PASSWORD=$(STARHSAPI__PASSWORD)}" \
	--region $(AWS__REGION) \
  --profile default

delete: ## Deploy from AWS lambda
	aws lambda delete-function --region $(AWS__REGION) --function-name $(AWS__FUNCTION_NAME)

# Helpers

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set"; \
		exit 1; \
	fi

clean: ## Clear up build artefacts
	rm -rf build
	rm archive.zip
