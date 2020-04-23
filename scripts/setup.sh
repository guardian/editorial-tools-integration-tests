#!/usr/bin/env bash

ENV=$1

green='\x1B[0;32m'
red='\x1B[0;31m'
plain='\x1B[0m' # No Color

hasCredentials() {
  STATUS=$(aws sts get-caller-identity --profile media-service 2>&1 || true)
  if [[ ${STATUS} =~ (ExpiredToken) ]]; then
    echo -e "${red}Credentials for the media-service profile are expired. Please fetch new credentials and run this again.${plain}"
    exit 1
  elif [[ ${STATUS} =~ ("could not be found") ]]; then
    echo -e "${red}Credentials for the media-service profile are missing. Please ensure you have the right credentials.${plain}"
    exit 1
  fi
}

hasCredentials

if [[ ! -z "${ENV}" ]]; then
    echo "Fetching cookie in env ${ENV}"
    ENV=${ENV} node src/utils/cookie.js > cookie.json
else
    echo "Fetching cookie using local credentials"
    node src/utils/cookie.js > cookie.json
fi
