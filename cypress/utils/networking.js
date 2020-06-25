const { baseUrls } = require('../../cypress.env.json');
const { cookie, domain } = require(`../../cookie.json`);

export function getDomain(prefix) {
  const stage = Cypress.env('STAGE').toLowerCase();
  const app = Cypress.env('APP');
  const appName = baseUrls[app] || app;
  const subdomain = prefix ? prefix + '.' + appName : appName;
  return stage.toLowerCase() === 'prod'
    ? `https://${subdomain}.gutools.co.uk/`
    : `https://${subdomain}.${stage}.dev-gutools.co.uk/`;
}

export function setCookie(cy, visitDomain = true) {
  cy.setCookie('gutoolsAuth-assym', cookie, {
    domain: `.${domain}`,
    path: '/',
    secure: true,
    httpOnly: true,
  });

  if (visitDomain) {
    cy.visit(getDomain());
    cy.wait(2);
  }
}
