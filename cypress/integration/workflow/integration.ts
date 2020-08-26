import { checkVars } from '../../utils/vars';
import { fetchAndSetCookie } from '../../utils/networking';
import { deleteArticlesFromWorkflow } from '../../utils/composer/api';
import {
  visitWorkflow,
  createArticleInWorkflow,
  searchInWorkflow,
  clickOnArticle,
} from '../../utils/workflow/utils';
import env from '../../../env.json';

const contentTitlePrefix = `Cypress Integration Testing Article`;
const uniqueContentTitle = `${contentTitlePrefix} ${Date.now()}`;
// We restrict our initial query to the Writers' status, which limits the amount
// of data the server returns. Unrestricted queries can yield responses of 10MB+,
// which take a long time to load and can cause tests to time out.
const defaultQueryString = '?status=Writers';

function setupRoutes() {
  cy.server();
  cy.route('/api/content').as('content');
  cy.route(`/api/content${defaultQueryString}`).as('contentWithDefaultQuery');
  cy.route({
    method: 'POST',
    url: '/api/stubs',
  }).as('stubs');
  cy.route(`/api/content?text=${uniqueContentTitle.replace(/\s/g, '+')}`).as(
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
    setupRoutes();
    checkVars();
    fetchAndSetCookie({ visitDomain: false });
  });

  after(() => {
    fetchAndSetCookie({ visitDomain: false });
    deleteArticlesFromWorkflow(contentTitlePrefix);
  });

  it('Create an article from within Workflow and delete it', function () {
    visitWorkflow(`/dashboard${defaultQueryString}`);
    createArticleInWorkflow(uniqueContentTitle);
    searchInWorkflow(uniqueContentTitle);
    clickOnArticle(uniqueContentTitle);

    // Delete from within Workflow
    cy.get('.drawer__toolbar-item--danger').click();
  });

  it.only('Create an article in Workflow, change status within Composer and delete it', function () {
    const articleTitle = uniqueContentTitle + 'change-status';

    visitWorkflow();
    createArticleInWorkflow(articleTitle);
    searchInWorkflow(articleTitle);
    cy.wait('@searchForText');

    // Move to Desk status
    cy.get('#testing-content-list-item__field--status--select').select('Desk');

    // Clear search
    cy.get('#testing-dashboard-toolbar-section-search').clear().type('{enter}');

    // Search for just Training section articles
    cy.get('.top-toolbar')
      .find('[ui-view=view-toolbar]')
      .contains('Section')
      .click()
      .parent()
      .contains('Training')
      .click()
      .get('.top-toolbar')
      .find('[ui-view=view-toolbar]')
      .contains('Section')
      .click(); // Close the top dropdown

    // Filter for only Desk articles
    // This doesn't actually affect the search, but good to know this works?
    cy.get('.sidebar').contains('Desk').click();
    searchInWorkflow(articleTitle);
    clickOnArticle(articleTitle);

    // Click on Management tab
    cy.get('[data-cy=management-drawer]').click();
    cy.get('.drawer__item')
      .contains('Status')
      .parent()
      .find('select')
      // Assert status is Desk
      .should('have.value', 'string:Desk');

    // Delete from within Workflow
    cy.get('.drawer__toolbar-item--danger').click();
  });
});
