#!/usr/bin/env bash

set -e

STAGE=${1:-PROD}
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function runTests() {
    FAILURES_FILE="${DIR}/../${SUITE}.failures.txt"
    rm "${FAILURES_FILE}" || true

    if [[ $STAGE == "CODE" || $STAGE == "code" ]]; then
      GRID_STAGE="test"
    else
      GRID_STAGE=$STAGE
    fi

    STAGE="${STAGE}" GRID_STAGE="${GRID_STAGE}" npm run --silent cy:live || true
    STAGE="${STAGE}" npm run upload-video
}


"${DIR}"/setup.sh "${STAGE}"
echo "$(date): Running integration tests"
pushd "${DIR}"/../ > /dev/null
runTests

popd > /dev/null
