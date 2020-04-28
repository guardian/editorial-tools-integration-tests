#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

ENV=$1

set -e

${DIR}/setup.sh "${ENV}"

docker run -it -v $PWD:/e2e -w /e2e cypress/included:4.3.0
