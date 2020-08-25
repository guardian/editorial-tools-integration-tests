import { checkVars } from '../../utils/vars';
import { fetchAndSetCookie, getDomain } from '../../utils/networking';
import { deleteAllArticles } from '../../utils/composer/api';

const articleTitle = `Cypress Integration Testing Article ${Date.now()}`;

// We restrict our initial query to the Writers' status, which limits the amount
// of data the server returns. Unrestricted queries can yield responses of 10MB+,
// which take a long time to load and can cause tests to time out.
const defaultQueryString = '?status=Writers'

describe('Workflow Integration Tests', () => {
  beforeEach(() => {
    checkVars();
    fetchAndSetCookie({ visitDomain: false });
  });

  after(() => {
    fetchAndSetCookie({ visitDomain: false });
    deleteAllArticles();
  });

  it('Create an article from within Workflow', function () {
    cy.server();
    cy.route(`/api/content${defaultQueryString}`).as('content');
    cy.route({
      method: 'POST',
      url: '/api/stubs',
    }).as('stubs');
    cy.route(`/api/content?text=${articleTitle.replace(/\s/g, '+')}`).as(
      'searchForArticle'
    );

    cy.visit(`${getDomain()}/dashboard${defaultQueryString}`)
      .wait('@content')
      .get('.wf-loader', { timeout: 30000 })
      .should('not.exist');

    // Create article
    cy.get('[wf-dropdown-toggle]').contains('Create new').click();
    cy.get('#testing-dashboard-create-dropdown-Article').click();
    cy.get('#stub_title').type(articleTitle);
    cy.get('#stub_section').select('Training');
    cy.get('#testing-create-in-composer').click();
    cy.get('.modal-dialog')
      .contains('Completed successfully!')
      .should('exist')
      .get('.close')
      .click()
      .wait('@stubs');

    // Search for it in Workflow
    cy.get('#testing-dashboard-toolbar-section-search').type(
      articleTitle + '{enter}'
    );

    // Click on search result
    cy.wait('@searchForArticle')
      .wait(2000)
      .get('#testing-content-list-item-title-anchor-text')
      .contains(articleTitle)
      .should('exist')
      .parent()
      .click();

    // Delete from within Workflow
    cy.get('.drawer__toolbar-item--danger').click();
  });
});
