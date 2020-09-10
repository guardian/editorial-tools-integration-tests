import { getDomain } from '../networking';
import env from '../../../env.json';
import { APPS } from '../values';

const app = APPS.composer;

export function createAndEditArticle() {
  cy.server();
  cy.route(`/api/content?collaboratorEmail=${env.user.email}**`).as(
    'apiCollaborator'
  );

  cy.visit(getDomain({ app })).wait('@apiCollaborator');
  cy.get('#js-dashboard-create-dropdown')
    .click()
    .get('#js-dashboard-create-article')
    .click()
    .wait(2000)
    .url()
    .should('include', '/content/')
    .log('Article created');
}
