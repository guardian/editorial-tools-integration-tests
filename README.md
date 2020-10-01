# Editorial Tools Integration Tests

Integration testing using [Cypress](https://www.cypress.io/).

This repository currently includes testing for:

  * Grid
  * Composer
  * Workflow

For more Composer and Workflow testing, see [editorial-tools-production-monitoring](git@github.com:guardian/editorial-tools-production-monitoring.git).

## Setup

To set up, you will need credentials for the media-service account in order to fetch the config.

```shell script
$ ./scripts/setup.sh # Installs node modules via yarn, fetches config
```

## Cloudformation / how to deploy


### First time deploy / update cloudformation

You can find information on how to deploy the infrastructure to AWS in the [AWS CDK directory](./cdk).

### Regular deploys

Deploy this app via TeamCity & RiffRaff.

## To run


### Using the interactive Cypress test suite 

**To use Cypress' lovely interactive suite, run `scripts/dev.sh`.**

```shell script
$ ./scripts/dev.sh <APP> <STAGE>
$ ./scripts/dev.sh grid code # Opens up the interactive suite, recommended if developing on the tests and wanting quick feedback!
```

 
### Against remote service

To run the tests in the CLI, you can run `scripts/start.sh` and pass in the app and stage.

```shell script
$ ./scripts/start.sh <application> <stage>
$ ./scripts/start.sh grid test
```

### Against local service

To run against a local instance of an app, you can run the local instance and call the script against `<app> local`.

## To develop

Tests are located in `cypress/integration`. They are written in mocha/chai with Cypress commands to navigate the DOM. 
Any `spec` files within the `cypress/integration` folder will be picked up by the test runner automatically.

An example test for MyCoolService in a file located in `cypress/integration/<APP>/myCoolService.ts` looks like the following:

```js
describe('MyCoolService Integration Tests', () => { // It's good to have the service name in your top describe block
  it('Can click on a cool link by typing in the search bar', function () { // Name of the test
    cy.get('.search-bar').type('Here I am typing in the search bar!');
    cy.get('.cool-link').click();
    cy.url().should('equal', 'https://my-cool-service.com/links/cool-link');
  });
});
```

## To add a new test to a service already being tested

To do this, find the test suite or the service from within `cypress/integration`, 
and either add a new test to the pre-existing suite or create a new test suite for the set of tests you'd like to add.

## To add a new service

In the interests of keeping this repository organised, the best practice for adding a new service is to do the following (using a service called `my-new-service` as an example):

  1. Create a subfolder and test file for the service in `cypress/integration`. For example:

```bash
$ mkdir cypress/integration/my-new-service
$ touch cypress/integration/my-new-service/spec.ts
```

  2. Follow the example in `To develop` above to create your first test
    - In order to set the cookie before running your tests, you can import the cookie and set it like so:
```js
// In `cypress/integration/myNewService/spec.ts
import { fetchAndSetCookie } from '../../utils/networking';

describe('MyNewService Integration Tests', () => {
    beforeEach(() => {
      fetchAndSetCookie();
    });

    it('Can do a thing', function () {
      //  Define test here using Cypress, Mocha/Chai and whatever else you need
      });
});
```

  3. Run `scripts/start.sh` with the right arguments to test your service!
```shell script
$ ./scripts/start.sh myNewService prod
```

### To add the service to the production testing suite 

If you want to start running these tests in production and alerting on them, you can add them to `scripts/run.sh`:

```shell script
# scripts/run.sh
...

runTests grid
runTests composer
runTests myNewService # This will call the test suite in production

...
```
