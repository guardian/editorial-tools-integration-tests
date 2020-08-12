#!/usr/bin/env bash

set -e

STAGE=${1:-PROD}
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function runTests() {
    SUITE=$1
    FAILURES_FILE="${DIR}/../${SUITE}.failures.txt"
    rm "${FAILURES_FILE}" || true
    SUITE=${SUITE} STAGE="${STAGE}" npm run --silent cy:live || true
    SUITE=${SUITE} STAGE="${STAGE}" node scripts/uploadVideo.js
}

"${DIR}"/setup.sh "${STAGE}"

echo "$(date): Running integration tests"

pushd "${DIR}"/../ > /dev/null

# To make a test suite run in prod, add it here
# runTests <APP>
runTests grid
runTests composer
runTests workflow

popd > /dev/null
