# Editorial Tools Integration Tests

Integration testing using [Cypress](https://www.cypress.io/).

This repository currently includes testing for:

* Grid

For Composer and Workflow testing, see [editorial-tools-production-monitoring](git@github.com:guardian/editorial-tools-production-monitoring.git).

## Run locally

1. Spin up a local instance of the Grid
2. Run `./scripts/start.sh` to get a valid cookie and boot up Cypress

## Develop

Tests are located in `cypress/integration`. They are written in mocha/chai with Cypress commands to navigate the DOM.

You can run cypress interactively by running `npm run cy:open`.
