# Editorial Tools Integration Tests

Integration testing using [Cypress](https://www.cypress.io/).

This repository currently includes testing for:

  * Grid

For Composer and Workflow testing, see [editorial-tools-production-monitoring](git@github.com:guardian/editorial-tools-production-monitoring.git).

## Setup

```bash
$ npm install # Fetches the node modules
```

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

## To develop

Tests are located in `cypress/integration`. They are written in mocha/chai with Cypress commands to navigate the DOM. 
Any `spec` files within the `cypress/integration` folder will be picked up by the test runner automatically.

An example test for MyCoolService looks like the following:

```js
describe('MyCoolService Integration Tests', () => { // It's good to have the service name in your top describe block
  it('Can click on a cool link by typing in the search bar', function () { // Name of the test
    cy.get('.search-bar').type('Here I am typing in the search bar!');
    cy.get('.cool-link').click();
    cy.url().should('equal', 'https://my-cool-service.com/links/cool-link');
  });
});
```

*To use Cypress' lovely interactive suite, run `scripts/dev.sh`.

## To add a new test to a service already being tested

To do this, find the test suite or the service from within `cypress/integration`, 
and either add a new test to the pre-existing suite or create a new test suite for the set of tests you'd like to add.

## To add a new service

In the interests of keeping this repository organised, the best practice for adding a new service is to do the following (using a service called `my-new-service` as an example):

1. Add the required information to `cypress.env.json`. Every key in the file is ingested by the cookie generator script `src/utils/cookie.js`, 
with the `baseUrl` of each being used to create a cookie. 
Note that if you don't need a `gutools` cookie for your service, you can skip this step and reference the URL directly in the tests.
    - In the below example, a cookie called `my-new-service.cookie.json` would be created in the root of 
the repository, given the necessary `.settings` configuration file is found in the S3 bucket referenced in `env.json`.
    - The `.settings` config file looks at the top-level domain of the URL you are looking to hit, so, if your domain was `service.gutools.co.uk`, it would look for a settings file called `gutools.settings`.
    - For futher information on how the cookie gets validated, please see the [pan-domain-node repository](https://github.com/guardian/pan-domain-authentication/#to-verify-login-in-nodejs) that `cookie.js` leverages to authenticate itself with Guardian domains.
```json
# env.json
{ 
  ...
  ...
  "my-new-service": { "baseUrl": "https://some-new-service-I-want-to-test.gutools.co.uk" }
}
```
2. Create a subfolder and test file for the service in `cypress/integration`. For example:
```bash
$ mkdir cypress/integration/my-new-service
$ touch cypress/integration/my-new-service/my-new-service_spec.js
```
3. Follow the example in `To develop` above to create your first test
    - In order to ensure you're using the same URL as the cookie you generated for it, you can use `const baseUrl = Cypress.env('my-new-service').baseUrl`
    to get the URL used in the cookie generation step in your tests.
    - In order to set the cookie before running your tests, you can import the cookie and set it like so:
```js
 beforeEach(() => {
    const { cookie, domain } = require(`../../../my-new-service.cookie.json`);

    cy.setCookie('gutoolsAuth-assym', cookie, {
      domain: `.${domain}`,
      path: '/',
      secure: true,
      httpOnly: true,
    });
  });
```

