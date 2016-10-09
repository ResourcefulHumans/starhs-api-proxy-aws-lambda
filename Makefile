.DEFAULT_GOAL := help
.PHONY: help deploy

AWS__REGION ?= "eu-central-1"
AWS__FUNCTION_NAME ?= "staRHsAPIproxy"

# TODO: envify
archive.zip: *.js **/*.js
	rm -f $@
	zip -q -r $@ ./

deploy: archive.zip ## Deploy to AWS lambda
	aws lambda create-function \
	--region $(AWS__REGION) \
	--function-name $(AWS__FUNCTION_NAME) \
	--zip-file fileb://./archive.zip \
	--role $(AWS__ROLE) \
	--timeout 60 \
	--handler index.handler \
	--runtime nodejs4.3

update: TemplateMailer.zip ## Update the lambda function with new build
	aws lambda update-function-code \
	--region $(AWS__REGION) \
	--function-name $(AWS__FUNCTION_NAME) \
	--zip-file fileb://./archive.zip

delete: ## Deploy from AWS lambda
	aws lambda delete-function --region $(AWS__REGION) --function-name $(AWS__FUNCTION_NAME)
