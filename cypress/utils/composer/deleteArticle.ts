import { getDomain } from '../networking';

export function deleteArticle(
  id: string,
  options?: { app?: string; stage?: string }
) {
  clickIntoArticle(id);
  deleteArticleFromManagement(id, options);
}

function clickIntoArticle(id: string) {
  cy.get(`a[href*="/content/${id}"]`).click().wait(2000);
}

export function deleteArticleFromManagement(
  id: string,
  options?: { app?: string; stage?: string }
) {
  cy.get('#js-management-edit')
    .click()
    .get('#js-content-information-delete')
    .click({ force: true })
    .get('#js-content-information-delete')
    .click({ force: true })
    .url()
    .should('equal', `${getDomain(options)}/`);
}
