const { baseUrls } = require('../../cypress.env.json');
const { cookie, domain } = require(`../../cookie.json`);

export function getDomain(prefix) {
  const stage = Cypress.env('STAGE');
  const app = Cypress.env('APP');
  const appName = baseUrls[app] || app;
  const subdomain = prefix ? prefix + '.' + appName : appName;
  if (stage.toLowerCase() === 'prod') {
    return `https://${subdomain}.gutools.co.uk/`;
  } else {
    return `https://${subdomain}.${stage}.dev-gutools.co.uk/`;
  }
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
