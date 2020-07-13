export function checkVars() {
  const stage = Cypress.env('STAGE');
  expect(!!stage, 'STAGE environment variable').to.be.true;
  const app = Cypress.env('APP');
  expect(!!app, 'APP environment variable').to.be.true;
}
