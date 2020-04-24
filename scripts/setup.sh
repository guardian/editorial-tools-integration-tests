#!/usr/bin/env bash

ENV=$1

bold='\x1B[0;1m'
green='\x1B[0;32m'
red='\x1B[0;31m'
plain='\x1B[0m' # No Color

GRID_ENV=$(cat cypress.env.json | jq -r .baseUrl)

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
    echo -e "Fetching cookie in env ${ENV} for environment: ${bold}${GRID_ENV}${plain}"
    ENV=${ENV} node src/utils/cookie.js > cookie.json
else
    echo -e "Fetching cookie using local credentials for environment: ${bold}${GRID_ENV}${plain}"
    node src/utils/cookie.js > cookie.json
fi

if [[ ! -s cookie.json ]]; then
    echo -e "${red}Cookie unsuccessfully fetched.${plain}"
    exit 1
fi


echo -e "${green}Cookie fetched!${plain}"
