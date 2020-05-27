#!/usr/bin/env bash

set -e

ENV=$1
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

${DIR}/setup.sh "${ENV}"

echo "$(date): Running integration tests"

npm run cy:run-dev
