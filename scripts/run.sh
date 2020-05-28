#!/usr/bin/env bash

set -e

ENV=$1
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

${DIR}/setup.sh "${ENV}"

echo "$(date): Running integration tests"

pushd "${DIR}"/../ 2>&1 /dev/null
docker run \
    --rm \
    -v $PWD:/e2e \
    -v ${HOME}/.aws/credentials:/aws/credentials:ro \
    -w /e2e \
    cypress/included:4.3.0
popd 2>&1 /dev/null
