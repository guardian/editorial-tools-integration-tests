#!/usr/bin/env bash

set -e

STAGE=${1:-LOCAL}
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ACCOUNT="media-service"

if [[ ${STAGE} != "PROD"  ]]; then
    aws s3 cp s3://editorial-tools-integration-tests-dist/env.dev.json ${DIR}/../env.json --profile "${ACCOUNT}"
else
    aws s3 cp s3://editorial-tools-integration-tests-dist/env.dev.json ${DIR}/../env.json
fi
