import 'cypress-file-upload';
import 'cypress-iframe';

import { getDomain, fetchAndSetCookie } from '../../utils/networking';
import { checkVars } from '../../utils/vars';
import { deleteImages, getImageHash, getImageURL } from '../../utils/grid/api';
import * as uploads from '../../utils/grid/upload';
import * as crops from '../../utils/grid/crop';
import * as image from '../../utils/grid/image';
import * as collections from '../../utils/grid/collections';
import { resetCollection } from '../../utils/grid/collections';
import { createAndEditArticle } from '../../utils/composer/createArticle';
import { getId } from '../../utils/composer/getId';
import {
  deleteArticle,
  deleteArticlesViaApi,
} from '../../utils/composer/deleteArticle';
import { stopEditingAndClose } from '../../utils/composer/stopEditingAndClose';

// ID of `cypress/fixtures/GridmonTestImage.png`
const dragImageID = getImageHash();
const rootCollection = 'Cypress Integration Testing';
const date = Date.now().toString();
const waits = { createCrop: 1000 };
const articlesToDelete: string[] = [];

function setupAliases() {
  cy.server();
  cy.route(`/images/${dragImageID}`).as('getDragNDrop');
  cy.route(`/images/${getImageHash()}`).as('getImage');
  cy.route(`/images?q=&l**`).as('search');
}

describe('Grid Key User Journeys', function () {
  before(() => {
    checkVars();
    fetchAndSetCookie({ visitDomain: false });
    deleteArticlesViaApi(articlesToDelete);
    deleteImages(cy, [getImageHash()]);
    resetCollection(cy, rootCollection);
  });

  beforeEach(() => {
    fetchAndSetCookie({ visitDomain: false });
    setupAliases();
  });

  after(() => {
    fetchAndSetCookie({ visitDomain: false });
    deleteImages(cy, [getImageHash()]);
    deleteArticlesViaApi(articlesToDelete);
    resetCollection(cy, rootCollection);
  });

  it('Upload image, set rights, set metadata, create crop, delete all crops', function () {
    const imageUrl = `${getDomain({ prefix: 'api' })}/images/${dragImageID}`;
    const crop = {
      width: '900',
      height: '540',
      xValue: '1020',
      yValue: '581',
    };

    const cropsUrl = `${getDomain({
      prefix: 'cropper',
    })}/crops/${getImageHash()}`;

    const cropID = `${crop.xValue}_${crop.yValue}_${crop.width}_${crop.height}`;

    cy.visit(getDomain(), {
      onBeforeLoad(win) {
        cy.stub(win, 'prompt').returns('DELETE');
      },
    });

    // Drag image to Grid
    cy.get('[data-cy="upload-button"]').attachFile('GridmonTestImage.png', {
      subjectType: 'drag-n-drop',
    });
    cy.get('ui-upload-jobs .result-editor__img', { timeout: 10000 }).should(
      'exist'
    );
    // Assert that image isn't usable before rights are added
    cy.request('GET', imageUrl).then((res) => {
      const { usageRights } = res.body.data;
      expect(
        JSON.stringify(usageRights),
        'Usage rights before rights are added'
      ).to.equal('{}');
    });

    uploads.setRights('screengrab', date);
    uploads.addLabel('integration test label');
    uploads.addCredit('Editorial Tools Integration Tests');
    uploads.addImageToCollection('Cypress Integration Testing');

    cy.get(`ui-upload-jobs [href="/images/${dragImageID}"] img`).click();
    cy.url().should('equal', `${getDomain()}/images/${dragImageID}`);

    cy.request('GET', imageUrl).then((res) => {
      // Assert that image is usable after rights are added
      const { usageRights } = res.body.data;
      expect(usageRights).to.have.property('category', 'screengrab');
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

    cy.url({ timeout: 10000 }).should(
      'equal',
      `${getImageURL()}?crop=${cropID}`
    );

    const url = `${getDomain({ prefix: 'cropper' })}/crops/${getImageHash()}`;
    cy.request('GET', url).then((res) => {
      const cropsBeforeDelete = res.body.data;
      expect(
        cropsBeforeDelete.filter((ex: { id: string }) => ex.id === cropID)
          .length,
        'Crop with correct ID'
      ).to.be.greaterThan(0);
    });

    crops.deleteAllCrops();

    cy.request('GET', cropsUrl).then((res) => {
      const cropsAfterDelete = res.body.data;
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

  it('Use Grid from within Composer to crop and import and image into an article', () => {
    const composerStage =
      Cypress.env('STAGE').toLowerCase() === 'test'
        ? 'code'
        : Cypress.env('STAGE');
    const composerUrl = getDomain({
      app: 'composer',
      stage: composerStage,
    });

    cy.visit(getDomain());

    // Drag image to Grid
    cy.get('[data-cy="upload-button"]').attachFile('GridmonTestImage.png', {
      subjectType: 'drag-n-drop',
    });
    cy.get('ui-upload-jobs .result-editor__img', { timeout: 10000 }).should(
      'exist'
    );

    uploads.setRights('screengrab', Date.now().toString());

    fetchAndSetCookie({ stage: composerStage, visitDomain: false });
    cy.visit(composerUrl);

    createAndEditArticle();
    cy.url().then(async (url) => {
      const id = getId(url, { app: 'composer', stage: composerStage });
      cy.log('Article id is ', id);
      articlesToDelete.push(id);

      // Click into article
      cy.get('.body-block-layout').click();

      // Click on Add Image button
      cy.get('.add-item__icon__svg--image').should('exist').click();

      // Check Grid iframe is loaded
      cy.frameLoaded('.embedded-grid-iframe', { url: getDomain() });

      const imageID = getImageHash();

      // Crop image from within iframe
      cy.enter('.embedded-grid-iframe').then((getBody) => {
        getBody()
          .find('[data-cy="image-search-input"]')
          .click({ force: true })
          .type(`${imageID}{enter}`, {
            force: true,
          }); // Search for image by ID

        getBody()
          .find(`[href="/images/${imageID}"]`)
          .find('.preview__image')
          .click({ force: true }); // Click on image in Grid

        getBody()
          .find('[data-cy=crop-image-button]', { timeout: 10000 })
          .should('exist')
          .click(); // Go to crop creation UI

        // Wait for cropper image to exist before continuing
        getBody().find('.cropper-face', { timeout: 10000 }).should('exist');
        getBody().find('.button').click(); // Crop image
      });

      cy.get(`[src*="${imageID}"]`).should('exist'); // Assert image is in Composer
      cy.get('[title="Remove this element"]')
        .click({ force: true })
        .click({ force: true }); // Confirm delete by clicking twice

      stopEditingAndClose();
      deleteArticle(id, { app: 'composer', stage: composerStage });

      cy.visit(getImageURL(), {
        onBeforeLoad(win) {
          cy.stub(win, 'prompt').returns('DELETE');
        },
      });

      // Go to image and delete crops
      crops.deleteAllCrops();
    });
  });
});
