import { getGridDomain as getDomain } from '../networking';

export function createChild(collection: string, name: string) {
  // Click on edit collections button
  cy.get('[data-cy=edit-collections-button]').click();

  // Click on button and create new child
  cy.get(`[data-cy="${collection}-collection"]`)
    .find('[data-cy=create-new-folder-button]')
    .click({ force: true });

  // Type name of new child
  cy.get(`[data-cy="${collection}-collection"]`)
    .parent()
    .find('[data-cy=collection-child-input]')
    .type(name);

  // Save child
  cy.get(`[data-cy="${collection}-collection"]`)
    .parent()
    .find('[data-cy=save-child-button]')
    .click({ force: true })
    .should('not.exist');

  // Stop editing collections
  cy.get('[data-cy=edit-collections-button]').click();
}

export function goToChild(collection: string, child: string) {
  // Go to new collection
  cy.get(`[data-cy="${collection}-collection"] button`).click({
    force: true,
  });
  cy.get(`[data-cy="${collection}-collection"]`)
    .parent()
    .contains(child)
    .click({ force: true });
}

export function deleteChild(collection: string, child: string) {
  // Click on edit collections button
  cy.get('[data-cy=edit-collections-button]').click();

  // Delete child collection
  cy.get(`[data-cy="${collection}-collection"]`)
    .parent()
    .contains(child)
    .parent()
    .contains('delete')
    .click({ force: true })
    .click({ force: true }); // confirm delete crop
}

export function resetCollection(cy: Cypress.cy, rootCollection: string) {
  const url = `${getDomain('media-collections')}/collections`;
  // Delete collection
  const rootCollectionUrl = `${url}/${encodeURIComponent(rootCollection)}`;
  cy.request({
    method: 'DELETE',
    url: rootCollectionUrl,
    headers: {
      Origin: getDomain('integration-tests'),
    },
  });
  cy.request({
    url,
    method: 'POST',
    body: JSON.stringify({ data: rootCollection }),
    headers: {
      'Content-Type': 'application/json',
      Origin: getDomain('integration-tests'),
    },
  });
}
