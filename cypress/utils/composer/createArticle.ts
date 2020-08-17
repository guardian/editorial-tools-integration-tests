import { getDomain } from '../networking';
import env from '../../../env.json';

export function createAndEditArticle() {
  cy.server();
  cy.route(`/api/content?collaboratorEmail=${env.user.email}**`).as(
    'apiCollaborator'
  );

  cy.visit(getDomain()).wait('@apiCollaborator');
  cy.get('#js-dashboard-create-dropdown')
    .click()
    .get('#js-dashboard-create-article')
    .click()
    .wait(2000)
    .log('Article created');
}
