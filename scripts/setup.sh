#!/usr/bin/env bash

set -e

STAGE=${1:-LOCAL}
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ACCOUNT="media-service"

bold='\x1B[0;1m'
green='\x1B[0;32m'
red='\x1B[0;31m'
plain='\x1B[0m' # No Color

checkIfAbleToTalkToAWS() {
  if [[ ${STAGE} != "PROD" ]]; then
    STATUS=$(aws sts get-caller-identity --profile ${ACCOUNT} 2>&1 || true)
  else
    STATUS=$(aws sts get-caller-identity 2>&1 || true)
  fi

  if [[ ${STATUS} =~ (ExpiredToken) ]]; then
    echo -e "${red}Credentials for the ${ACCOUNT} profile are expired. Please fetch new credentials and run this again.${plain}"
    exit 1
  elif [[ ${STATUS} =~ ("could not be found") ]]; then
    echo -e "${red}Credentials for the ${ACCOUNT} profile are missing. Please ensure you have the right credentials.${plain}"
    exit 1
  fi
}

fetchEnv() {
    if [[ ! -f ${DIR}/../env.json ]]; then
        "${DIR}/fetch-config.sh" "${STAGE}"
    fi
}

checkIfAbleToTalkToAWS
yarn --silent # install node dependencies
fetchEnv
