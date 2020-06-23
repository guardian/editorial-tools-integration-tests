import { setCookie } from '../../utils/networking';
import { checkVars } from '../../utils/vars';
import { wait } from '../../utils/wait';
import { getImageHash, getImageURL } from '../../utils/grid/image';

const date = new Date().toString();

describe('Grid Integration Tests', () => {
  beforeEach(() => {
    checkVars();
    setCookie(cy);
    cy.server();
    cy.route(`/images/${getImageHash()}`).as('image');
    cy.route(`/images?q=${getImageHash()}**`).as('searchForImage');
  });

  it('Can find an image by ID in search', function () {
    cy.get('[data-cy=image-search-input]')
      .type(getImageHash() + '{enter}')
      .wait('@searchForImage');
    cy.get(`a.preview__link[href*="${getImageHash()}"]`).click().wait('@image');
    cy.url().should('equal', getImageURL());
  });

  xit('Should be able to add and delete a lease', () => {
    cy.visit(getImageURL());

    cy.get('[data-cy=it-add-lease-icon] > .gr-icon').click();
    cy.get('#access-select').select('allow-use');
    cy.get('.lease__form > .ng-pristine').clear().type('someNotes');
    cy.get('[data-cy=it-save-lease').click();
    wait(1);
    cy.get('[data-cy=it-confirm-delete-lease]').click();
    cy.get('[data-cy=it-confirm-delete-lease]').click();
    wait(1);

    // TODO: Add an appropriate assertion here
    cy.url().should('include', '/');
  });

  it('edit the image description, byline, credit and copyright', () => {
    cy.visit(getImageURL());

    // Edit the description
    cy.get('[data-cy=it-edit-description-button]').click({ force: true });
    cy.get('[data-cy=metadata-description] .editable-has-buttons')
      .clear()
      .type(date);
    cy.get(
      '[data-cy=metadata-description] .editable-buttons > .button-save'
    ).click();

    // Edit the byline
    cy.get('[data-cy=it-edit-byline-button]').click({ force: true });
    cy.get('[data-cy=metadata-byline] .editable-has-buttons')
      .clear()
      .type(date);
    cy.get(
      '[data-cy=metadata-byline] .editable-buttons > .button-save'
    ).click();

    // Edit the credit
    cy.get('[data-cy=it-edit-credit-button]').click({ force: true });
    cy.get('[data-cy=metadata-credit] .editable-has-buttons')
      .clear()
      .type(date);
    cy.get(
      '[data-cy=metadata-credit] .editable-buttons > .button-save'
    ).click();

    // Edit the copyright
    cy.get('[data-cy=it-edit-copyright-button]').click({ force: true });
    cy.get('[data-cy=metadata-copyright] .editable-has-buttons')
      .clear()
      .type(date);
    cy.get(
      '[data-cy=metadata-copyright] .editable-buttons > .button-save'
    ).click();
  });

  xit('add image to and remove image from a collection', () => {});

  it('add and remove labels from an image', () => {
    cy.visit(getImageURL());
    cy.get('[data-cy=it-add-label-button]').click();
    cy.get('.text-input').clear().type('someLabelHere');
    cy.get('.gr-add-label__form__buttons__button-save').click();
    cy.get('.labeller')
      .contains('someLabelHere', { timeout: 5000 })
      .should('exist');
    cy.get('.labeller')
      .contains('someLabelHere')
      .parent()
      .find('[data-cy=it-remove-label-button]')
      .click();
  });

  it('edit the photoshoot section', () => {
    cy.visit(getImageURL());

    cy.get('[data-cy=it-photoshoot-edit-button]').click({ force: true });
    cy.get('.editable-has-buttons').clear().type(date);
    cy.get('.editable-buttons > .button-save').click();
    cy.get(
      '.top-bar-item > gr-icon-label > .icon-label > ng\\:transclude'
    ).click();
  });

  it('can change the rights', function () {
    cy.visit(getImageURL());
    cy.get('[data-cy=it-edit-usage-rights-button]').click({ force: true });
    cy.get('[data-cy=it-rights-select]').select('screengrab');
    cy.get('[data-cy=it-edit-usage-input]').type(date);
    cy.get('.ure__bar > .button-save').click();
  });
});
