import { getDomain } from '../networking';
import { getApiKey } from './api';

module.exports = {
  createChild(collection, name) {
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
  },

  goToChild(collection, child) {
    // Go to new collection
    cy.get(`[data-cy="${collection}-collection"] button`).click({
      force: true,
    });
    cy.get(`[data-cy="${collection}-collection"]`)
      .parent()
      .contains(child)
      .click({ force: true });
  },

  deleteChild(collection, child) {
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
  },

  resetCollection(cy, rootCollection) {
    const url = `${getDomain(null, 'media-collections')}collections`;
    // Delete collection
    const rootCollectionUrl = `${url}/${encodeURIComponent(rootCollection)}`;
    cy.request({
      method: 'DELETE',
      url: rootCollectionUrl,
      headers: { 'X-Gu-Media-Key': getApiKey(Cypress.env('STAGE')) },
    });
    cy.request({
      url,
      method: 'POST',
      body: JSON.stringify({ data: rootCollection }),
      headers: {
        'Content-Type': 'application/json',
        'X-Gu-Media-Key': getApiKey(Cypress.env('STAGE')),
      },
    });
  },
};
