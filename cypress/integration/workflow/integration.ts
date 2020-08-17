import { checkVars } from '../../utils/vars';
import { fetchAndSetCookie, getDomain } from '../../utils/networking';
import { deleteArticlesFromWorkflow } from '../../utils/composer/api';

const contentTitlePrefix = `Cypress Integration Testing Article`;
const uniqueContentTitle = `${contentTitlePrefix} ${Date.now()}`;

describe('Workflow Integration Tests', () => {
  beforeEach(() => {
    checkVars();
    fetchAndSetCookie({ visitDomain: false });
  });

  after(() => {
    fetchAndSetCookie({ visitDomain: false });
    deleteArticlesFromWorkflow(contentTitlePrefix);
  });

  it('Create an article from within Workflow', function () {
    cy.server();
    cy.route('/api/content').as('content');
    cy.route({
      method: 'POST',
      url: '/api/stubs',
    }).as('stubs');
    cy.route(`/api/content?text=${uniqueContentTitle.replace(/\s/g, '+')}`).as(
      'searchForArticle'
    );

    cy.visit(getDomain())
      .wait('@content')
      .get('.wf-loader', { timeout: 30000 })
      .should('not.exist');

    // Create article
    cy.get('[wf-dropdown-toggle]').contains('Create new').click();
    cy.get('#testing-dashboard-create-dropdown-Article').click();
    cy.get('#stub_title').type(uniqueContentTitle);
    cy.get('#stub_section').select('Training');
    cy.get('#testing-create-in-composer').click();
    cy.get('.modal-dialog')
      .contains('Completed successfully!')
      .should('be.visible')
      .get('.alert-danger')
      .should('not.be.visible')
      .get('.close')
      .click()
      .wait('@stubs');

    // Search for it in Workflow
    cy.get('#testing-dashboard-toolbar-section-search').type(
      uniqueContentTitle + '{enter}'
    );

    // Click on search result
    cy.wait('@searchForArticle')
      .wait(2000)
      .get('#testing-content-list-item-title-anchor-text')
      .contains(uniqueContentTitle)
      .should('exist')
      .parent()
      .click();

    // Delete from within Workflow
    cy.get('.drawer__toolbar-item--danger').click();
  });
});
