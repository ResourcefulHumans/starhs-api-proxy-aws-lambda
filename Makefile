.DEFAULT_GOAL := help
.PHONY: help deploy

AWS__REGION ?= "eu-central-1"
AWS__LAMBDA_PREFIX ?= "staRHsAPI"

archive.zip: *.js **/*.js
	rm -f $@
	zip -q -r $@ ./

deploy: archive.zip
	AWS__REGION=$(AWS__REGION) \
	AWS__LAMBDA_PREFIX=$(AWS__LAMBDA_PREFIX) \
	AWS__ROLE=$(AWS__ROLE) \
	node deploy
