#!/usr/bin/env bash

set -e

echo "##teamcity[blockOpened name='npm']"
yarn
echo "##teamcity[blockClosed name='npm']"

echo "##teamcity[testSuiteStarted name='lint']"
yarn lint
echo "##teamcity[testSuiteFinished name='lint']"

echo "##teamcity[compilationStarted compiler='riffraff']"
yarn riffraff
echo "##teamcity[compilationFinished compiler='riffraff']"

