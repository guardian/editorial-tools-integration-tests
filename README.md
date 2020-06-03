# Editorial Tools Integration Tests

Integration testing using [Cypress](https://www.cypress.io/).

This repository currently includes testing for:

* Grid

For Composer and Workflow testing, see [editorial-tools-production-monitoring](git@github.com:guardian/editorial-tools-production-monitoring.git).

## Run locally

To run locally, all you need to do is fetch the dependencies then call `./scripts/start.sh`.

```bash
$ npm install # Fetches the node modules
$ ./scripts/start.sh # Fetches config and creates a cookie for each service configured in cypress.env.json
```

These tests use the `cypress.env.json` file to generate cookies and assert the base URL to run tests on. 
Running `scripts/start.sh` will fetch the necessary configuration to run the tests, given you have permission (via credentials or otherwise) to access the `media-service` account.


## Develop

Tests are located in `cypress/integration`. They are written in mocha/chai with Cypress commands to navigate the DOM. 
Any `spec` files within the `cypress/integration` folder will be picked up by the test runner automatically.

## To add a new test

## To add a new service to test
