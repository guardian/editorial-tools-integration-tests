export function dragImageToGrid(fixture: string) {
  cy.get('[data-cy="upload-button"]').attachFile(fixture, {
    subjectType: 'drag-n-drop',
  });
}

export function ensureImageUploadedCorrectly() {
  cy.get('.job-status').should('not.contain', 'uploading');
  cy.get('.job-status').should('not.contain', ' upload error (unknown) ');
}

export function setRights(rightsType: string, usage: string) {
  cy.get('ui-upload-jobs [data-cy=edit-rights-button]')
    .click({ force: true })
    .get('ui-upload-jobs [data-cy=it-rights-select]')
    .select(rightsType)
    .get('ui-upload-jobs [data-cy=it-edit-usage-input]')
    .type(usage)
    .get('ui-upload-jobs [data-cy=save-usage-rights]')
    .click()
    .should('not.exist');
}

export function addLabel(name: string) {
  cy.get('ui-upload-jobs [data-cy=it-add-label-button]')
    .click()
    .get('ui-upload-jobs [data-cy=label-input]')
    .type(name)
    .get('ui-upload-jobs [data-cy=save-new-label-button]')
    .click()
    .should('not.exist');
}

export function addCredit(name: string) {
  cy.get('ui-upload-jobs [data-cy=image-metadata-credit]').clear().type(name);
}

export function addImageToCollection(collection) {
  cy.get('ui-upload-jobs [data-cy=add-image-to-collection-button]').click();
  cy.get('.collection-overlay__collections')
    .find(`[data-cy="${collection}-collection"]`)
    .contains(`${collection}`)
    .click({ force: true })
    .should('not.exist');
}
