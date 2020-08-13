#!/usr/bin/env bash

set -e

STAGE=${1:-LOCAL}
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"


bold='\x1B[0;1m'
green='\x1B[0;32m'
red='\x1B[0;31m'
plain='\x1B[0m' # No Color

checkForNodeModules() {
  if [[ ! -d ${DIR}/../node_modules ]]; then
    echo -e "${red}No node_modules found, please run yarn.${plain}"
    exit 1
  fi
}

checkIfAbleToTalkToAWS() {
  if [[ ${STAGE} != "PROD" ]]; then
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
    if [[ ! -f ${DIR}/../env.json ]]; then
        "${DIR}/fetch-config.sh" "${STAGE}"
    fi
}

checkForNodeModules
checkIfAbleToTalkToAWS
fetchEnv
