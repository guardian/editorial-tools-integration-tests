export function createCrop(
  width: string,
  height: string,
  xValue: string,
  yValue: string,
  wait: number
) {
  // Select freeform crop
  cy.get('[data-cy=crop-options]').contains('freeform').click();
  // Edit width
  cy.get('[data-cy=crop-width-input]').clear().type(width);
  // Edit height
  cy.get('[data-cy=crop-height-input]').clear().type(height);
  // Edit x coordinate
  cy.get('[data-cy=crop-x-value-input]').clear().type(xValue);
  // Edit y coordinate
  cy.get('[data-cy=crop-y-value-input]').clear().type(yValue);

  cy.get('.button').click().wait(wait);
}

export function deleteAllCrops() {
  // Delete all crops
  cy.get('[data-cy=delete-all-crops-button]')
    .click()
    .click()
    .get('[data-cy=delete-all-crops-button]')
    .should('not.exist');
}
