const { baseUrls } = require('../../cypress.env.json');
const { cookie, domain } = require(`../../cookie.json`);

export function getDomain(prefix, overrideApp) {
  const stage = Cypress.env('STAGE').toLowerCase();
  const app = overrideApp || Cypress.env('APP');
  const appName = baseUrls[app] || app;
  const subdomain = prefix ? prefix + '.' + appName : appName;
  return stage.toLowerCase() === 'prod'
    ? `https://${subdomain}.gutools.co.uk/`
    : `https://${subdomain}.${stage}.dev-gutools.co.uk/`;
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

export function fetchAndSetCookie() {
  return cy.task('getCookie', Cypress.env('STAGE')).then((cookie) => {
    expect(cookie).to.have.property('cookie');
    expect(cookie).to.have.property('domain');
    return setCookie(cy, cookie, false);
  });
}
