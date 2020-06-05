import { getId } from './getId';
import { startEditing } from './startEditing';

export async function createAndEditArticle() {
  return new Promise(async (resolve, reject) => {
    cy.get('#js-dashboard-create-dropdown').click();
    cy.get('#js-dashboard-create-article').click().wait(2000);

    startEditing();
    cy.url().then((url) => {
      resolve(getId(url));
    });
  });
}
