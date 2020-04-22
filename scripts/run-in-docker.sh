#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

STAGE=$1

set -e

if [[ ! -z "${STAGE}" ]]; then
    ${DIR}/setup.sh "${STAGE}"
else
    ${DIR}/setup.sh
fi

docker run -it -v $PWD:/e2e -w /e2e cypress/included:4.3.0
