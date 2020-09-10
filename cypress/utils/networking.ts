import { baseUrls } from '../../cypress.env.json';

interface Cookie {
  cookie: string;
  domain: string;
}

interface GetDomainOptions {
  app?: string;
  prefix?: string;
  stage?: string;
}

export function getDomain(options?: GetDomainOptions) {
  const stage = options?.stage || Cypress.env('STAGE').toLowerCase();
  const app = options?.app || Cypress.env('APP');
  const appName = baseUrls[app] || app;
  const subdomain = options?.prefix ? options.prefix + '.' + appName : appName;
  return stage.toLowerCase() === 'prod'
    ? `https://${subdomain}.gutools.co.uk`
    : `https://${subdomain}.${stage}.dev-gutools.co.uk`;
}

export function setCookie(cy: Cypress.cy & EventEmitter, cookie: Cookie) {
  cy.setCookie('gutoolsAuth-assym', cookie.cookie, {
    domain: `.${cookie.domain}`,
    path: '/',
    secure: true,
    httpOnly: true,
  });
}

export function fetchAndSetCookie(stage = Cypress.env('STAGE')) {
  return cy.task('getCookie', stage).then((cookie) => {
    expect(cookie).to.have.property('cookie');
    expect(cookie).to.have.property('domain');
    return setCookie(cy, (cookie as unknown) as Cookie);
  });
}
