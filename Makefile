.DEFAULT_GOAL := help
.PHONY: help deploy

AWS__REGION ?= "eu-central-1"
AWS__FUNCTION_NAME ?= "staRHsAPIproxy"

archive.zip: *.js **/*.js
	rm -f $@
	rm -rf build
	npm run build
	cp package.json build
	cp config.production.json build
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

update: archive.zip ## Update the lambda function with new build
	aws lambda update-function-code \
	--region $(AWS__REGION) \
	--function-name $(AWS__FUNCTION_NAME) \
	--zip-file fileb://$<

delete: ## Deploy from AWS lambda
	aws lambda delete-function --region $(AWS__REGION) --function-name $(AWS__FUNCTION_NAME)
