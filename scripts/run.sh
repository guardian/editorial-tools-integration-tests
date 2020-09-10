#!/usr/bin/env bash

set -e

STAGE=${1:-PROD}
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="${DIR}/.."

function resetTmpFiles() {
    TMP_DIR="${ROOT_DIR}/tmp"
    rm -r "${TMP_DIR}" || true
    mkdir "${TMP_DIR}"
}

function runTests() {
    SUITE=$1

    if [[ $SUITE == "grid" && ($STAGE == "CODE" || $STAGE == "code")]]; then
      REALSTAGE="test"
    else
      REALSTAGE=$STAGE
    fi

    SUITE=${SUITE} STAGE="${REALSTAGE}" npm run --silent cy:live || true
    SUITE=${SUITE} STAGE="${REALSTAGE}" npm run upload-video
}

resetTmpFiles

"${DIR}"/setup.sh "${STAGE}"

echo "$(date): Running integration tests"

pushd "${DIR}"/../ > /dev/null

# To make a test suite run in prod, add it here
# runTests <APP>
runTests grid
runTests composer
runTests workflow

popd > /dev/null
