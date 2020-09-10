#!/usr/bin/env bash

set -e

STAGE=${1:-PROD}
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="${DIR}/.."

function deleteTmpFiles() {
  rm -r "${ROOT_DIR}/tmp" || true
}

function runTests() {
    STAGE="${STAGE}" npm run --silent cy:live || true
    STAGE="${STAGE}" npm run upload-video
}


"${DIR}"/setup.sh "${STAGE}"
echo "$(date): Running integration tests"
pushd "${DIR}"/../ > /dev/null
deleteTmpFiles
runTests

popd > /dev/null
