#!/usr/bin/env bash

set -e

STAGE=${1:-PROD}
SUITE=$2
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
ROOT_DIR="${DIR}/.."

function setup() {
  resetTmpFiles
  "${DIR}"/setup.sh "${STAGE}"
  getRealStage
}

function resetTmpFiles() {
  TMP_DIR="${ROOT_DIR}/tmp"
  rm -r "${TMP_DIR}" || true
  mkdir "${TMP_DIR}"
}

function getRealStage() {
  if [[ $SUITE == "grid" && ($STAGE == "CODE" || $STAGE == "code") ]]; then
    REALSTAGE="test"
  else
    REALSTAGE=$STAGE
  fi
}

function runTests() {
  SUITE=$1

  SUITE=${SUITE} STAGE="${REALSTAGE}" npm run --silent cy:live-suite || true
  SUITE=${SUITE} STAGE="${REALSTAGE}" npm run upload-video
}

setup
pushd "${DIR}"/../ >/dev/null

if [[ $SUITE ]]; then
  echo "$(date): Running integration tests for ${SUITE}"
  runTests "${SUITE}"
else
  echo "$(date): Running all integration tests"
  STAGE="${REALSTAGE}" npm run --silent cy:live || true
  STAGE="${REALSTAGE}" npm run upload-video
fi

popd >/dev/null
