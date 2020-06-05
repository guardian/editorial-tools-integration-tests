const { baseUrls } = require('../../cypress.env.json');
const { cookie, domain } = require(`../../cookie.json`);
const Config = require('../../src/utils/config');

export function getDomain() {
  const appName = baseUrls[Config.suite] || Config.suite;
  return `https://${appName}.${Config.toolsDomain}/`
}

export function setCookie(cy) {
  cy.setCookie('gutoolsAuth-assym', cookie, {
    domain: `.${domain}`,
    path: '/',
    secure: true,
    httpOnly: true,
  });

  cy.visit(getDomain());
  cy.wait(2);
}
