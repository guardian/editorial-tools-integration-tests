const { baseUrls } = require('../../cypress.env.json');
const { cookie, domain } = require(`../../cookie.json`);

export function getDomain(prefix, app, stage) {
  const argOrEnvStage = stage || Cypress.env('STAGE').toLowerCase();
  const argOrEnvApp = app || Cypress.env('APP');
  const appName = baseUrls[argOrEnvApp] || argOrEnvApp;
  const subdomain = prefix ? prefix + '.' + appName : appName;
  return argOrEnvStage.toLowerCase() === 'prod'
    ? `https://${subdomain}.gutools.co.uk/`
    : `https://${subdomain}.${argOrEnvStage}.dev-gutools.co.uk/`;
}

export function setCookie(cy, overrides, visitDomain = true) {
  const cookieToSet = overrides ? overrides.cookie : cookie;
  const domainToSet = overrides ? overrides.domain : domain;
  cy.setCookie('gutoolsAuth-assym', cookieToSet, {
    domain: `.${domainToSet}`,
    path: '/',
    secure: true,
    httpOnly: true,
  });

  if (visitDomain) {
    cy.visit(getDomain());
    cy.wait(2);
  }
}
