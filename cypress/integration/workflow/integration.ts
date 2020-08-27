import { checkVars } from '../../utils/vars';
import { fetchAndSetCookie } from '../../utils/networking';
import { deleteArticlesFromWorkflow } from '../../utils/composer/api';
import {
  visitWorkflow,
  createArticle,
  searchFor,
  clickOnArticle,
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
    fetchAndSetCookie({ visitDomain: false });
  });

  after(() => {
    fetchAndSetCookie({ visitDomain: false });
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
});
