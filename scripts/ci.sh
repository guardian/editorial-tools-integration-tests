#!/usr/bin/env bash

set -e

npm ci
npm run lint
npm run riffraff