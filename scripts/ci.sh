#!/usr/bin/env bash

set -e

echo "##teamcity[blockOpened name='npm']"
npm ci
echo "##teamcity[blockClosed name='npm']"

echo "##teamcity[testSuiteStarted name='lint']"
npm run lint
echo "##teamcity[testSuiteFinished name='lint']"

echo "##teamcity[compilationStarted compiler='riffraff']"
npm run riffraff
echo "##teamcity[compilationFinished compiler='riffraff']"

