#!/usr/bin/env bash

set -e

ENV=$1

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
FAILURES_FILE="${DIR}/../failures.txt"

${DIR}/setup.sh "${ENV}"

echo "$(date): Running integration tests"

pushd "${DIR}"/../ 2>&1 /dev/null
rm "${FAILURES_FILE}" || true

docker run \
    --rm \
    -v $PWD:/e2e \
    -w /e2e \
    cypress/included:4.3.0 || true

npm run upload-video
popd 2>&1 /dev/null
