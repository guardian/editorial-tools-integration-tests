import { getDomain } from '../networking';

export function getId(url: string, options?: { app?: string; stage?: string }) {
  const domain = getDomain(options);
  cy.location('href').should('match', new RegExp(`${domain}/content\/`));
  return url.split('/')[4];
}
