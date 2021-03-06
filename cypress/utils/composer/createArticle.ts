import { getDomain } from '../networking';
import env from '../../../env.json';
import { apps } from '../values';

export function createAndEditArticle() {
  cy.server();
  cy.route(`/api/content?collaboratorEmail=${env.user.email}**`).as(
    'apiCollaborator'
  );

  cy.visit(getDomain(apps.composer)).wait('@apiCollaborator');
  cy.get('#js-dashboard-create-dropdown')
    .click()
    .get('#js-dashboard-create-article')
    .click()
    .wait(2000)
    .url()
    .should('include', '/content/')
    .log('Article created');
}
