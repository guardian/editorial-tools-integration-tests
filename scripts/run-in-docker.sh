#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

ENV=$1

set -e

if [[ ! -z "${ENV}" ]]; then
    ${DIR}/setup.sh "${ENV}"
else
    ${DIR}/setup.sh
fi

docker run -it -v $PWD:/e2e -w /e2e cypress/included:4.3.0
