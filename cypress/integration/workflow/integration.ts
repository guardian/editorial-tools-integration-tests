import { checkVars } from '../../utils/vars';
import { fetchAndSetCookie } from '../../utils/networking';
import { deleteArticlesFromWorkflow } from '../../utils/composer/api';
import {
  visitWorkflow,
  createArticleInWorkflow,
  searchInWorkflow,
  clickOnArticle,
} from '../../utils/workflow/utils';

const contentTitlePrefix = `Cypress Integration Testing Article`;
const uniqueContentTitle = `${contentTitlePrefix} ${Date.now()}`;
// We restrict our initial query to the Writers' status, which limits the amount
// of data the server returns. Unrestricted queries can yield responses of 10MB+,
// which take a long time to load and can cause tests to time out.
const defaultQueryString = '?status=Writers'

function setupRoutes() {
  cy.server();
  cy.route(`/api/content${defaultQueryString}`).as('content');
  cy.route({
    method: 'POST',
    url: '/api/stubs',
  }).as('stubs');
  cy.route(`/api/content?text=${uniqueContentTitle.replace(/\s/g, '+')}`).as(
    'searchForArticle'
  );
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

  it('Create an article from within Workflow', function () {
    cy.visit(`${getDomain()}/dashboard${defaultQueryString}`)
      .wait('@content')
      .get('.wf-loader', { timeout: 30000 })
      .should('not.exist');

  after(() => {
    fetchAndSetCookie({ visitDomain: false });
    deleteArticlesFromWorkflow(contentTitlePrefix);
  });

  it('Create an article from within Workflow and delete it', function () {
    visitWorkflow();
    createArticleInWorkflow(uniqueContentTitle);
    searchInWorkflow(uniqueContentTitle);
    clickOnArticle(uniqueContentTitle);

    // Delete from within Workflow
    cy.get('.drawer__toolbar-item--danger').click();
  });

  it('Create an article in Workflow, change status within Composer and delete it', function () {
    visitWorkflow();
    createArticleInWorkflow(uniqueContentTitle + 'A');
  });
});
