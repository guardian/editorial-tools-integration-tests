const { baseUrls } = require('../../cypress.env.json');
const { cookie, domain } = require(`../../cookie.json`);

export function getDomain(prefix) {
  const stage = Cypress.env('STAGE');
  const app = Cypress.env('APP');
  const appName = baseUrls[app] || app;
  if (stage.toLowerCase() === 'prod') {
    return `https://${prefix ? `${prefix}.` : ''}${appName}.gutools.co.uk/`;
  } else {
    return `https://${
      prefix ? `${prefix}.` : ''
    }${appName}.${stage}.dev-gutools.co.uk/`;
  }
}

export function getApiDomain() {
  const stage = Cypress.env('STAGE');
  const app = Cypress.env('APP');
  const appName = baseUrls[app] || app;
  if (stage.toLowerCase() === 'prod') {
    return `https://api.${appName}.gutools.co.uk/`;
  } else {
    return `https://api.${appName}.${stage}.dev-gutools.co.uk/`;
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
