# Editorial Tools Integration Tests

Integration testing using [Cypress](https://www.cypress.io/).

This repository currently includes testing for:

  * Grid

For Composer and Workflow testing, see [editorial-tools-production-monitoring](git@github.com:guardian/editorial-tools-production-monitoring.git).

## Run against remote service

```bash
npm run --silent <application>-<stage>
```

Note that not all applications and environments are supported!  Use `npm run` to list. 

For example: 

```bash
npm run --silent grid-prod
```

## Run locally

1. Spin up a local instance of the Grid
2. Run `npm run --silent grid-local`

## Develop

Tests are located in `cypress/integration`, with a subdirectory per service. 

They are written in mocha/chai with Cypress commands to navigate the DOM.
