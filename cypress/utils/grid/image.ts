module.exports = {
  editRights(rightsType, usage) {
    cy.get('[data-cy=it-edit-usage-rights-button]').click({ force: true });
    cy.get('[data-cy=it-rights-select]').select(rightsType);
    cy.get('[data-cy=it-edit-usage-input]').type(usage);
    cy.get('.ure__bar > .button-save')
      .click({ timeout: 5000 }) // Why do we need to wait?
      .should('not.exist');
  },

  editDescription(description) {
    cy.get('[data-cy=it-edit-description-button]').click({ force: true });
    cy.get('[data-cy=metadata-description] .editable-has-buttons')
      .clear()
      .type(description);
    cy.get('[data-cy=metadata-description] .editable-buttons > .button-save')
      .click()
      .should('not.exist');
  },

  editByline(byline) {
    cy.get('[data-cy=it-edit-byline-button]').click({ force: true });
    cy.get('[data-cy=metadata-byline] .editable-has-buttons')
      .clear()
      .type(byline);
    cy.get('[data-cy=metadata-byline] .editable-buttons > .button-save')
      .click()
      .should('not.exist');
  },

  editCredit(credit) {
    cy.get('[data-cy=it-edit-credit-button]').click({ force: true });
    cy.get('[data-cy=metadata-credit] .editable-has-buttons')
      .clear()
      .type(credit);
    cy.get('[data-cy=metadata-credit] .editable-buttons > .button-save')
      .click()
      .should('not.exist');
  },

  editCopyright(copyright) {
    cy.get('[data-cy=it-edit-copyright-button]').click({ force: true });
    cy.get('[data-cy=metadata-copyright] .editable-has-buttons')
      .clear()
      .type(copyright);
    cy.get('[data-cy=metadata-copyright] .editable-buttons > .button-save')
      .click()
      .should('not.exist');
  },

  addLabel(name) {
    cy.get('[data-cy=it-add-label-button]').click();
    cy.get('.text-input').clear().type(name);
    cy.get('.gr-add-label__form__buttons__button-save')
      .click()
      .should('not.exist');
    cy.get('.labeller').contains(name, { timeout: 10000 }).should('exist');
  },

  removeLabel(date) {
    cy.get('.labeller')
      .contains(date)
      .parent()
      .find('[data-cy=it-remove-label-button]')
      .click()
      .should('not.exist');
  },
};
