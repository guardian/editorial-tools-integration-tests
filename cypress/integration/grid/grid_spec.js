const date = new Date().toString();
// details of the image in assets/prodmontestimage12345.png
const testImage = {
  hash: '133fa319db2e156852fac65b812daceaf1f69557',
  metadata: {title: 'GridmonTestImage'},
};

const imageURL = `${Cypress.env('baseUrl')}/images/${testImage.hash}`;

function typeInSearchBox(contents) {
  cy.get('[data-cy=image-search-input]').type(contents);
}

describe('Grid Integration Tests', () => {
  beforeEach(() => {
    const {cookie, domain} = require('../../../cookie.json');

    cy.setCookie('gutoolsAuth-assym', cookie, {
      domain: `.${domain}`,
      path: '/',
      secure: true,
      httpOnly: true,
    });

    cy.visit(Cypress.env('baseUrl') + '/');
    cy.wait(2);
  });

  it('Can find an image by ID in search', function() {
    typeInSearchBox(testImage.hash);
    cy.wait(3);
    cy.get(`a.preview__link[href*="${testImage.hash}"]`).click();
    cy.wait(3);
    // Assert no "image not found"
    cy.url().should('equal', imageURL);
  });

  it('Search for for image by metadata (title)', function() {
    typeInSearchBox(testImage.metadata.title);
    cy.wait(3);
    cy.get(`a.preview__link[href*="${testImage.hash}"]`).click();
    cy.wait(3);
    cy.url().should('equal', imageURL);
    // Assert no "image not found"
  });

  it('Returns an error message if image is not found', function() {
    cy.visit(Cypress.env('baseUrl') + '/images/someimagehashthatdefinitelydoesnotexist');
    cy.get('.full-error').should(($div) => {
      const text = $div.text();
      expect(text).to.include('Error: Image not found');
    });
  });

  xit('Upload an image to the Grid', function() { });
  xit('Upload image, edit the usage rights, then find it in search', function() { });

  xit('Should be able to add and delete a lease', () => {
    cy.visit(imageURL);

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

  it('Edit the image description, byline, credit and copyright', () => {
    cy.visit(imageURL);

    // Edit the description
    cy.get('[data-cy=it-edit-description-button]').click({force: true});
    cy.get('.editable-has-buttons').clear().type(date);
    cy.get('.editable-buttons > .button-save').click();
    wait(3);

    // Edit the byline
    cy.get('[data-cy=it-edit-byline-button]').click({force: true});
    cy.get('.editable-has-buttons').clear().type(date);
    cy.get('.editable-buttons > .button-save').click();
    wait(3);

    // Edit the credit
    cy.get('[data-cy=it-edit-credit-button]').click({force: true});
    cy.get('.editable-has-buttons').clear().type(date);
    cy.get('.editable-buttons > .button-save').click();
    wait(3);

    // Edit the copyright
    cy.get('[data-cy=it-edit-copyright-button]').click({force: true});
    cy.get('.editable-has-buttons').clear().type(date);
    cy.get('.editable-buttons > .button-save').click();
    wait(3);
  });

  xit('add image to and remove image from a collection', () => {});

  it('add and remove labels from an image', () => {
    cy.visit(imageURL);
    cy.get('[data-cy=it-add-label-button]').click();
    cy.get('.text-input').clear().type('someLabelHere');
    cy.get('.gr-add-label__form__buttons__button-save').click();
    wait(1);
    cy.contains('someLabelHere')
        .parent()
        .find('[data-cy=it-remove-label-button]')
        .click();
  });

  it('edit the photoshoot section', () => {
    cy.visit(imageURL);

    cy.get('[data-cy=it-photoshoot-edit-button]').click({force: true});
    cy.get('.editable-has-buttons').clear().type(date);
    cy.get('.editable-buttons > .button-save').click();
    cy.get(
        '.top-bar-item > gr-icon-label > .icon-label > ng\\:transclude',
    ).click();
  });

  it('can change the rights', function() {
    cy.visit(imageURL);
    cy.get('[data-cy=it-edit-usage-rights-button]').click({force: true});
    cy.get('[data-cy=it-rights-select]').select('screengrab');
    cy.get('[data-cy=it-edit-usage-input]').type(date);
    cy.get('.ure__bar > .button-save').click();
    wait(3);
  });
});

const wait = (seconds) => cy.wait(seconds * 1000);
