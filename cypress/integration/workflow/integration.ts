import { checkVars } from '../../utils/vars';
import { fetchAndSetCookie } from '../../utils/networking';
import { deleteArticlesFromWorkflow } from '../../utils/composer/api';
import {
  visitWorkflow,
  createArticle,
  searchFor,
  clickOnArticle,
  toggleToolbarDropdown,
  assertStatusInManagementTab,
  clearSearch,
} from '../../utils/workflow/utils';
import env from '../../../env.json';

const contentTitlePrefix = `Cypress Integration Testing Article`;
let uniqueContentTitle: string;
// We restrict our initial query to the Writers' status, which limits the amount
// of data the server returns. Unrestricted queries can yield responses of 10MB+,
// which take a long time to load and can cause tests to time out.
export const defaultQueryString = '?status=Writers';

function setupRoutes(contentTitle: string) {
  cy.server();
  cy.route('/api/content').as('content');
  cy.route(`/api/content${defaultQueryString}`).as('contentWithDefaultQuery');
  cy.route({
    method: 'POST',
    url: '/api/stubs',
  }).as('stubs');
  cy.route(`/api/content?text=${contentTitle.replace(/\s/g, '+')}`).as(
    'searchForArticle'
  );
  cy.route(`/api/content?text=**`).as('searchForText');

  cy.route({
    method: 'GET',
    url: `/preferences/${env.user.email}/workflow**`,
    response: [],
  });
}

describe('Workflow Integration Tests', () => {
  beforeEach(() => {
    uniqueContentTitle = `${contentTitlePrefix} ${Date.now()}`;
    setupRoutes(uniqueContentTitle);
    checkVars();
    fetchAndSetCookie();
  });

  after(() => {
    fetchAndSetCookie();
    deleteArticlesFromWorkflow(contentTitlePrefix);
  });

  it('Create an article from within Workflow and delete it', function () {
    visitWorkflow(`/dashboard${defaultQueryString}`);
    createArticle(uniqueContentTitle);
    searchFor(uniqueContentTitle);
    clickOnArticle(uniqueContentTitle);

    // Delete from within Workflow
    cy.get('.drawer__toolbar-item--danger').click();
  });

  it('Create an article in Workflow, change status within Composer and delete it', function () {
    visitWorkflow();
    createArticle(uniqueContentTitle);
    searchFor(uniqueContentTitle);
    cy.wait('@searchForText');

    // Move to Desk status
    cy.get(`[data-cy="content-list-item-${uniqueContentTitle}"]`)
      .find('#testing-content-list-item__field--status--select')
      .select('Desk');

    // Assert that article has moved from Writers to Desk section
    cy.get('[data-cy=content-list-writers]').should(
      'not.contain',
      uniqueContentTitle
    );
    cy.get('[data-cy=content-list-desk]').should('contain', uniqueContentTitle);

    // Clear search so we can interact with filters again
    clearSearch();

    // Search for just Training section articles
    toggleToolbarDropdown('Section'); // opens dropdown
    cy.get('[ui-view=view-toolbar]').parent().contains('Training').click();
    toggleToolbarDropdown('Section'); // closes dropdown

    // Filter for only Desk articles
    cy.get('[data-cy=content-list-writers]').should('be.visible');
    cy.get('.sidebar').contains('Desk').click();
    cy.url().should('contain', '?status=Desk');
    cy.get('[data-cy=content-list-writers]').should('not.be.visible');
    cy.get('[data-cy=content-list-desk]').should('be.visible');

    searchFor(uniqueContentTitle);

    cy.get('[data-cy=content-list-desk]').should('contain', uniqueContentTitle);
    clickOnArticle(uniqueContentTitle);
    assertStatusInManagementTab('Desk');

    // Delete from within Workflow
    cy.get('.drawer__toolbar-item--danger').click();
  });
});
