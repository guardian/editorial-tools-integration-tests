#!/usr/bin/env bash

set -e

ENV=${1:-dev}


bold='\x1B[0;1m'
green='\x1B[0;32m'
red='\x1B[0;31m'
plain='\x1B[0m' # No Color

GRID_ENV=$(cat cypress.env.json | grep baseUrl | cut -d ":" -f 2-)

checkIfAbleToTalkToAWS() {
  if [[ ${ENV} == "dev" ]]; then
    STATUS=$(aws sts get-caller-identity --profile media-service 2>&1 || true)
  else
    STATUS=$(aws sts get-caller-identity 2>&1 || true)
  fi

  if [[ ${STATUS} =~ (ExpiredToken) ]]; then
    echo -e "${red}Credentials for the media-service profile are expired. Please fetch new credentials and run this again.${plain}"
    exit 1
  elif [[ ${STATUS} =~ ("could not be found") ]]; then
    echo -e "${red}Credentials for the media-service profile are missing. Please ensure you have the right credentials.${plain}"
    exit 1
  fi
}

checkIfAbleToTalkToAWS
echo -e "Fetching cookie for environment: ${bold}${GRID_ENV}${plain}"
ENV=${ENV} node src/utils/cookie.js > cookie.json

echo -e "${green}Cookie fetched!${plain}"
