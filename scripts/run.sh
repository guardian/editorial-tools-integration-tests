#!/usr/bin/env bash

set -e

STAGE=${1:-PROD}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
FAILURES_FILE="${DIR}/../failures.txt"

${DIR}/setup.sh "${STAGE}"
STAGE="${STAGE}" node "${DIR}"/../src/utils/cookie.js

echo "$(date): Running integration tests"

pushd "${DIR}"/../ > /dev/null
rm "${FAILURES_FILE}" || true

APP=grid STAGE="${STAGE}" npm run cy:live

node scripts/uploadVideo.js
popd > /dev/null
