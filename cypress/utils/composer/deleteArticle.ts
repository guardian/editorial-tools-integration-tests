import { getDomain } from '../networking';

export function deleteArticle(
  id: string,
  options?: { app?: string; stage?: string }
) {
  return cy
    .get(`a[href*="/content/${id}"]`)
    .click()
    .wait(2000)
    .get('#js-management-edit')
    .click()
    .get('#js-content-information-delete')
    .click({ force: true })
    .get('#js-content-information-delete')
    .click({ force: true })
    .wait(2000)
    .url()
    .should('equal', `${getDomain(options)}/`);
}
