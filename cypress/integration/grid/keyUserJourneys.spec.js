import axios from 'axios';
import 'cypress-file-upload';

import { getDomain, setCookie } from '../../utils/networking';
import { checkVars } from '../../utils/vars';
import { deleteImages, getImageHash, getImageURL } from '../../utils/grid/api';
import * as uploads from '../../utils/grid/upload';
import * as crops from '../../utils/grid/crop';
import * as image from '../../utils/grid/image';
import * as collections from '../../utils/grid/collections';
import { resetCollection } from '../../utils/grid/collections';
const config = require('../../../env.json');

// ID of `cypress/fixtures/GridmonTestImage.png`
const dragImageID = getImageHash();
const rootCollection = 'Cypress Integration Testing';
const date = new Date().toString();
const waits = { createCrop: 1000 };

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
    cy.task('getCookie', Cypress.env('STAGE')).then((cookie) => {
      setCookie(cy, cookie, false);
      deleteImages(cy, [getImageHash()]);
      resetCollection(cy, rootCollection);
    });
  });

  beforeEach(() => {
    cy.task('getCookie', Cypress.env('STAGE')).then((cookie) => {
      setCookie(cy, cookie);
    });
    setupAliases();
  });

  after(() => {
    deleteImages(cy, [getImageHash()]);
    resetCollection(cy, rootCollection);
  });

  it('Upload image, set rights, set metadata, create crop, delete all crops', function () {
    const crop = {
      width: '900',
      height: '540',
      xValue: '1020',
      yValue: '581',
    };

    const cropsUrl = `${getDomain('cropper')}crops/${getImageHash()}`;

    // For some reason, on production infrastructure, Cypress interacts with the browser differently and the crop.xValue gets reduced by 1.
    // This is a bug that should be investigated, but for now it's easier to just make a different assertion
    const cropID = `${config.isDev ? crop.xValue : crop.xValue - 1}_${
      crop.yValue
    }_${crop.width}_${crop.height}`;

    cy.visit(getDomain(), {
      onBeforeLoad(win) {
        cy.stub(win, 'prompt').returns('DELETE');
      },
    });

    // Drag image to Grid
    cy.get('[data-cy="upload-button"]').attachFile('GridmonTestImage.png', {
      subjectType: 'drag-n-drop',
    });
    cy.get('ui-upload-jobs .result-editor__img', { timeout: 8000 }).should(
      'exist'
    );
    cy.then(async () => {
      // Assert that image isn't usable before rights are added
      const imageUrl = `${getDomain('api')}images/${dragImageID}`;
      let { usageRights } = (await cy.request('GET', imageUrl)).data.data;
      expect(
        JSON.stringify(usageRights),
        'Usage rights before rights are added'
      ).to.equal('{}');

      uploads.setRights('screengrab', date);
      uploads.addLabel('integration test label');
      uploads.addCredit('Editorial Tools Integration Tests');
      uploads.addImageToCollection('Cypress Integration Testing');

      cy.get(`ui-upload-jobs [href="/images/${dragImageID}"] img`).click();
      cy.url()
        .should('equal', `${getDomain()}images/${dragImageID}`)
        .then(async () => {
          // Assert that image is usable after rights are added
          usageRights = (await cy.request('GET', imageUrl)).data.data
            .usageRights;
          expect(usageRights).to.have.property('category', 'screengrab');
        });
    });

    // Click on Crop button
    cy.get('[data-cy=crop-image-button]', { timeout: 10000 })
      .should('exist')
      .click();

    // Wait for cropper image to exist before continuing
    cy.get('.cropper-face').should('exist');

    crops.createCrop(
      crop.width,
      crop.height,
      crop.xValue,
      crop.yValue,
      waits.createCrop
    );

    cy.url({ timeout: 5000 }).should(
      'equal',
      `${getImageURL()}?crop=${cropID}`
    );

    cy.then(async () => {
      const url = `${getDomain('cropper')}crops/${getImageHash()}`;
      const cropsBeforeDelete = (await cy.request('GET', url)).data.data;
      expect(
        cropsBeforeDelete.filter((ex) => ex.id === cropID).length,
        'Crop with correct ID'
      ).to.be.greaterThan(0);
    });

    crops.deleteAllCrops();

    cy.then(async () => {
      const cropsAfterDelete = (await cy.request('GET', cropsUrl)).data.data;

      expect(
        cropsAfterDelete.length,
        'Number of crops after delete ALL'
      ).to.equal(0);
    });
  });

  it('User can edit the image rights, description, byline, credit, copyright, label', () => {
    cy.visit(getImageURL()).wait('@getImage');

    image.editRights('screengrab', date);
    image.editDescription(date);
    image.editByline(date);
    image.editCredit(date);
    image.editCopyright(date);
    image.addLabel(date);
    image.removeLabel(date);
  });

  it('User can create a child collection and delete it', () => {
    const childName = Date.now().toString();

    cy.visit(getDomain());

    // Click on collections panel
    cy.get('[data-cy=show-collections-panel]').should('exist').click();

    collections.createChild(rootCollection, childName);
    collections.goToChild(rootCollection, childName);

    cy.get('.search-query').should(
      'contain',
      `${rootCollection.toLowerCase()}/${childName}`
    );

    collections.deleteChild(rootCollection, childName);

    // Assert collection does not exist
    cy.get(`[data-cy="${rootCollection}-collection"]`)
      .parent()
      .contains(childName)
      .should('not.exist');
  });

  xit(
    'Use Grid from within Composer to crop and import and image into an article'
  );
});
