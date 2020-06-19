import axios from 'axios';
import 'cypress-file-upload';

import { getDomain, setCookie } from '../../utils/networking';
import { checkVars } from '../../utils/vars';
import { getImageHash, getImageURL } from '../../utils/grid/image';

// ID of `cypress/fixtures/drag-n-drop.png`
const id = '68991a0825f86a6b33ebcc6737bfe68340cd221f';

axios.defaults.withCredentials = true;

describe('Grid Key User Journeys', function () {
  beforeEach(() => {
    checkVars();
    setCookie(cy);
    cy.server();
    cy.route(`/images/${id}`).as('getDragNDrop');
    cy.route(`/images/${getImageHash()}`).as('getImage');
    cy.route(`/images?q=&length=1&orderBy=-uploadTime&free=true`).as('search');
  });

  it('User can find an image by Source metadata, click on the image, crop it, then delete the crop', function () {
    const crop = {
      width: '900',
      height: '540',
      xValue: '1020',
      yValue: '581',
    };
    const cropID = '1020_581_900_540';

    // This is done to bypass the prompt when deleting crops
    cy.visit(getDomain(), {
      onBeforeLoad(win) {
        cy.stub(win, 'prompt').returns('DELETE');
      },
    });
    cy.wait('@search').its('status').should('be', 200);
    cy.get('[data-cy=image-search-input]')
      .click({ force: true })
      .type('+source:GridmonTestImage{enter}');
    cy.get(`a.preview__link[href*="${getImageHash()}"]`).click();
    cy.url().should('equal', getImageURL());

    // Click on Crop button
    cy.get('[data-cy=crop-image-button]').click();
    cy.wait(6000);

    // Select freeform crop
    cy.get('[data-cy=crop-options]').contains('freeform').click();
    // Edit x coordinate
    cy.get('[data-cy=crop-x-value-input]').clear().type(crop.xValue);
    // Edit y coordinate
    cy.get('[data-cy=crop-y-value-input]').clear().type(crop.yValue);
    // Edit width
    cy.get('[data-cy=crop-width-input]').clear().type(crop.width);
    // Edit height
    cy.get('[data-cy=crop-height-input]').clear().type(crop.height);

    cy.get('.button').click().wait('@getImage');

    cy.url({ timeout: 5000 }).should(
      'equal',
      `${getImageURL()}?crop=${cropID}`
    );
    cy.then(async () => {
      const url = `${getDomain('cropper')}crops/${getImageHash()}`;
      const cropsBeforeDelete = (await axios.get(url)).data.data;
      expect(
        cropsBeforeDelete.filter((ex) => ex.id === cropID).length,
        'Crop with correct ID'
      ).to.be.greaterThan(0);

      // Delete all crops
      cy.get('[data-cy=delete-all-crops-button]').click().click();
      cy.wait(1000).then(async () => {
        const cropsAfterDelete = (await axios.get(url)).data.data;

        expect(
          cropsAfterDelete.length,
          'Number of crops after delete ALL'
        ).to.equal(0);
      });
    });
  });
  it('Upload image, add label, add to collection', function () {
    // Drag image to Grid
    cy.get('[data-cy="upload-button"]').attachFile('drag-n-drop.png', {
      subjectType: 'drag-n-drop',
    });
    cy.wait('@getDragNDrop');

    // Set rights as screengrab
    cy.get('ui-upload-jobs [data-cy=edit-rights-button]')
      .click({
        force: true,
      })
      .get('[data-cy=it-rights-select]')
      .select('screengrab')
      .get('[data-cy=it-edit-usage-input]')
      .type(Date.now().toString())
      .get('[data-cy=save-usage-rights]')
      .click();

    // Add label
    cy.get('ui-upload-jobs [data-cy=it-add-label-button]')
      .click()
      .get('ui-upload-jobs [data-cy=label-input]')
      .type('integration-test-label')
      .get('ui-upload-jobs [data-cy=save-new-label-button]')
      .click();

    // Add credit
    cy.get('ui-upload-jobs [data-cy=image-metadata-credit]')
      .clear()
      .type('Editorial Tools Integration Tests');

    // Add image to collection
    cy.get('ui-upload-jobs [data-cy=add-image-to-collection-button]').click();
    cy.get('.collection-overlay__collections')
      .contains('Cypress Integration Testing')
      .click();

    cy.get(`ui-upload-jobs [href="/images/${id}"] img`).click();
    cy.url().should('equal', `${getDomain()}images/${id}`);
  });
});
