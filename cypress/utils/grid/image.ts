import config from '../../../cypress.json';

export function editRights(rightsType: string, usage: string) {
  cy.get('[data-cy=it-edit-usage-rights-button]').click({ force: true });
  cy.get('[data-cy=it-rights-select]').select(rightsType);
  cy.get('[data-cy=it-edit-usage-input]').type(usage);
  cy.get('.ure__bar > .button-save')
    .click({ timeout: config.defaultCommandTimeout }) // Why do we need to wait?
    .should('not.exist');
}

export function editDescription(description: string) {
  cy.get('[data-cy=it-edit-description-button]').click({ force: true });
  cy.get('[data-cy=metadata-description] .editable-input')
    .clear()
    .type(description);
  cy.get('[data-cy=metadata-description] .editable-buttons > .button-save')
    .click()
    .should('not.exist');
}

export function editByline(byline: string) {
  cy.get('[data-cy=it-edit-byline-button]').click({ force: true });
  cy.get('[data-cy=metadata-byline] .editable-has-buttons')
    .clear()
    .type(byline);
  cy.get('[data-cy=metadata-byline] .editable-buttons > .button-save')
    .click()
    .should('not.exist');
}

export function editCredit(credit: string) {
  cy.get('[data-cy=it-edit-credit-button]').click({ force: true });
  cy.get('[data-cy=metadata-credit] .editable-has-buttons')
    .clear()
    .type(credit);
  cy.get('[data-cy=metadata-credit] .editable-buttons > .button-save')
    .click()
    .should('not.exist');
}

export function editCopyright(copyright: string) {
  cy.get('[data-cy=it-edit-copyright-button]').click({ force: true });
  cy.get('[data-cy=metadata-copyright] .editable-has-buttons')
    .clear()
    .type(copyright);
  cy.get('[data-cy=metadata-copyright] .editable-buttons > .button-save')
    .click()
    .should('not.exist');
}

export function addLabel(name: string) {
  cy.get('[data-cy=it-add-label-button]').click();
  cy.get('.text-input').clear().type(name);
  cy.get('.gr-add-label__form__buttons__button-save')
    .click()
    .should('not.exist');
  cy.get('.labels').contains(name, { timeout: 10000 }).should('exist');
}

export function removeLabel(date: string) {
  cy.get('.labels')
    .contains(date)
    .parent()
    .find('[data-cy=it-remove-label-button]')
    .click()
    .should('not.exist');
}
