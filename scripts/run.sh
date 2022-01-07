#!/usr/bin/env bash

set -e

PATH=/usr/local/node:$PATH

STAGE=${1:-PROD}
SUITE=$2
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
ROOT_DIR="${DIR}/.."

function resetTmpFiles() {
  TMP_DIR="${ROOT_DIR}/tmp"
  rm -r "${TMP_DIR}" || true
  mkdir "${TMP_DIR}"
}

function runTests() {
  SUITE=$1

  if [[ $SUITE == "grid" && ($STAGE == "CODE" || $STAGE == "code") ]]; then
    REALSTAGE="test"
  else
    REALSTAGE=$STAGE
  fi

  SUITE=${SUITE} STAGE="${REALSTAGE}" yarn run --silent cy:live || true
  SUITE=${SUITE} STAGE="${REALSTAGE}" yarn run upload-video
}

resetTmpFiles

"${DIR}"/setup.sh "${STAGE}"

pushd "${DIR}"/../ >/dev/null

if [[ $SUITE ]]; then
  echo "$(date): Running integration tests for ${SUITE}"
  runTests "${SUITE}"
else
  echo "$(date): Running all integration tests"
  # To make a test suite run in prod, add it here
  # runTests <APP>
  runTests workflow
  runTests grid
  runTests composer
fi

popd >/dev/null
