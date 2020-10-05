export function checkVars() {
  const stage = Cypress.env('STAGE');
  expect(!!stage, 'STAGE environment variable').to.be.true;
}
