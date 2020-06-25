import axios from 'axios';
import 'cypress-file-upload';

import { getDomain, setCookie } from '../../utils/networking';
import { checkVars } from '../../utils/vars';
import {
  deleteImages,
  getImageHash,
  getImageURL,
  readAndUploadImage,
} from '../../utils/grid/image';
const config = require('../../../env.json');

// ID of `cypress/fixtures/drag-n-drop.png`
const dragImageID = '68991a0825f86a6b33ebcc6737bfe68340cd221f';
const date = new Date().toString();
const waits = {
  cropperApi: 2500,
  createCrop: 1000,
  beforeAll: 5000,
  metadataApi: 6000,
};

axios.defaults.withCredentials = true;

function setupAliases() {
  cy.server();
  cy.route(`/images/${dragImageID}`).as('getDragNDrop');
  cy.route(`/images/${getImageHash()}`).as('getImage');
  cy.route(`/images?q=&l**`).as('search');
}

describe('Grid Key User Journeys', function () {
  before(() => {
    checkVars();
    deleteImages(cy, [getImageHash(), dragImageID]);
    readAndUploadImage(cy);
  });

  beforeEach(() => {
    setCookie(cy);
    setupAliases();
  });

  after(() => {
    deleteImages(cy, [getImageHash(), dragImageID]);
    readAndUploadImage(cy);
  });

  it('User can find an image by Source metadata, click on the image, crop it, then delete the crop', function () {
    const crop = {
      width: '900',
      height: '540',
      xValue: '1020',
      yValue: '581',
    };

    // For some reason, on production infrastructure, Cypress interacts with the browser differently and the crop.xValue gets reduced by 1.
    // This is a bug that should be investigated, but for now it's easier to just make a different assertion
    const cropID = `${config.isDev ? crop.xValue : crop.xValue - 1}_${
      crop.yValue
    }_${crop.width}_${crop.height}`;

    // Search for non-free, as image doesn't have rights yet
    cy.visit(getDomain() + '?nonFree=true')
      .wait('@search')
      .its('status')
      .should('be', 200);

    // Search for image
    cy.get('[data-cy=image-search-input]')
      .click({ force: true })
      .type('+source:GridmonTestImage{enter}');

    cy.get(`a [href="/images/${getImageHash()}"]`).should('exist').click();
    cy.url().should('equal', getImageURL());

    // Add screengrab rights
    cy.get('[data-cy=it-edit-usage-rights-button]')
      .click({ force: true })
      .get('[data-cy=it-rights-select]')
      .select('screengrab')
      .get('[data-cy=it-edit-usage-input]')
      .type(date)
      .get('.ure__bar > .button-save')
      .click()
      .should('not.exist');

    // Add description
    cy.get('[data-cy=it-edit-description-button]')
      .click({ force: true })
      .get('[data-cy=metadata-description] .editable-has-buttons')
      .clear()
      .type(date)
      .get('[data-cy=metadata-description] .editable-buttons > .button-save')
      .click()
      .should('not.exist');

    // Edit the credit
    cy.get('[data-cy=it-edit-credit-button]').click({ force: true });

    cy.get('[data-cy=metadata-credit] .editable-has-buttons')
      .clear()
      .type(date);
    cy.get('[data-cy=metadata-credit] .editable-buttons > .button-save')
      .click()
      .should('not.exist');

    // For now, we need to a wait a bit before cropping seems possible.
    // We should really find out where the source of the wait is
    cy.wait(waits.metadataApi);

    // Reload browser so the image drop option is available
    // This is done to bypass the prompt when deleting crops
    cy.visit(getImageURL(), {
      onBeforeLoad(win) {
        cy.stub(win, 'prompt').returns('DELETE');
      },
    }).wait('@getImage');

    // Click on Crop button
    cy.get('[data-cy=crop-image-button]', { timeout: 10000 })
      .should('exist')
      .click();

    // Wait for cropper image to exist before continuing
    cy.get('.cropper-face').should('exist');

    // Select freeform crop
    cy.get('[data-cy=crop-options]').contains('freeform').click();
    // Edit width
    cy.get('[data-cy=crop-width-input]').clear().type(crop.width);
    // Edit height
    cy.get('[data-cy=crop-height-input]').clear().type(crop.height);
    // Edit x coordinate
    cy.get('[data-cy=crop-x-value-input]').clear().type(crop.xValue);
    // Edit y coordinate
    cy.get('[data-cy=crop-y-value-input]').clear().type(crop.yValue);

    cy.get('.button').click().wait(waits.createCrop);

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
      cy.wait(waits.cropperApi).then(async () => {
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
    cy.wait('@getDragNDrop', { timeout: 8000 })
      .get('ui-upload-jobs .result-editor__img')
      .should('exist')
      .then(async () => {
        // Assert that image isn't usable before rights are added
        const url = `${getDomain('api')}images/${dragImageID}`;
        let { usageRights } = (await axios.get(url)).data.data;
        expect(JSON.stringify(usageRights)).to.equal('{}');

        // Set rights as screengrab
        cy.get('ui-upload-jobs [data-cy=edit-rights-button]')
          .click({ force: true })
          .get('ui-upload-jobs [data-cy=it-rights-select]')
          .select('screengrab')
          .get('ui-upload-jobs [data-cy=it-edit-usage-input]')
          .type(Date.now().toString())
          .get('ui-upload-jobs [data-cy=save-usage-rights]')
          .click()
          .should('not.exist');

        // Add label
        cy.get('ui-upload-jobs [data-cy=it-add-label-button]')
          .click()
          .get('ui-upload-jobs [data-cy=label-input]')
          .type('integration-test-label')
          .get('ui-upload-jobs [data-cy=save-new-label-button]')
          .click()
          .should('not.exist');

        // Add credit
        cy.get('ui-upload-jobs [data-cy=image-metadata-credit]')
          .clear()
          .type('Editorial Tools Integration Tests');

        // Add image to collection
        cy.get(
          'ui-upload-jobs [data-cy=add-image-to-collection-button]'
        ).click();
        cy.get('.collection-overlay__collections')
          .contains('Cypress Integration Testing')
          .click();

        cy.get(`ui-upload-jobs [href="/images/${dragImageID}"] img`).click();
        cy.url()
          .should('equal', `${getDomain()}images/${dragImageID}`)
          .then(async () => {
            // Assert that image is usable after rights are added
            usageRights = (await axios.get(url)).data.data.usageRights;
            expect(usageRights).to.have.property('category', 'screengrab');
          });
      });
  });

  it('User can edit the image description, byline, credit and copyright', () => {
    cy.visit(getImageURL()).wait('@getImage');

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

  xit(
    'Use Grid from within Composer to crop and import and image into an article'
  );
});
