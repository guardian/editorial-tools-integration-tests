#!/usr/bin/env bash

set -e

APP=$1
STAGE=$2

red='\x1B[0;31m'
plain='\x1B[0m' # No Color

if [[ -z "${APP}" || -z "${STAGE}" ]]; then
  echo -e "${red}Arguments missing, please pass an argument for APP and STAGE"
  echo -e "Usage: $ ${0} <APP> <STAGE>"
  echo -e "e.g.   $ ${0} grid prod${plain}"
  exit 1
fi

APP="${APP}" STAGE="${STAGE}" npm run --silent cy:open
