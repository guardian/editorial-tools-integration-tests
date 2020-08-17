import { getDomain } from '../networking';

export function getId(url: string, options?: { app?: string; stage?: string }) {
  const domain = getDomain(options);
  cy.location('href').should('match', new RegExp(`${domain}/content\/`));
  const id = url.split('/')[4];
  expect(id, 'article ID').to.not.be.undefined;
  return id;
}
