#!/usr/bin/env bash

set -e

ENV=${1:-dev}
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"


bold='\x1B[0;1m'
green='\x1B[0;32m'
red='\x1B[0;31m'
plain='\x1B[0m' # No Color

SERVICES=$(cat "${DIR}"/../cypress.env.json)

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

fetchEnv() {
  if [[ ${ENV} == "dev" ]]; then
      aws s3 cp s3://editorial-tools-integration-tests-dist/env.dev.json ${DIR}/../env.json --profile media-service
  else
      aws s3 cp s3://editorial-tools-integration-tests-dist/env.dev.json ${DIR}/../env.json
  fi
}


checkIfAbleToTalkToAWS
fetchEnv
echo -e "Fetching cookie for services: ${bold}${SERVICES}${plain}"
ENV=${ENV} node "${DIR}"/../src/utils/cookie.js

echo -e "${green}Cookie fetched!${plain}"
