import { checkVars } from '../../utils/vars';
import { fetchAndSetCookie, getDomain } from '../../utils/networking';
import { deleteAllArticles } from '../../utils/composer/api';

describe('Workflow Integration Tests', () => {
  beforeEach(() => {
    checkVars();
    fetchAndSetCookie({ visitDomain: false });
  });

  after(() => {
    fetchAndSetCookie({ visitDomain: false });
    deleteAllArticles();
  });

  // Skipping for now, as search bar behaviour makes this flappy
  xit('Create an article from within Workflow', function () {
    const articleTitle = `Cypress Integration Testing Article ${Date.now()}`;
    cy.server();
    cy.route(`/api/content?text=${articleTitle.split(' ').join('+')}`).as(
      'searchForArticle'
    );

    cy.visit(getDomain());

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
      .click();

    // Search for it in Workflow
    cy.get('#testing-dashboard-toolbar-section-search').type(
      articleTitle + '{enter}'
    );

    // TODO: Anticipate weird search bar behaviour in Workflow

    // Select article in Workflow
    cy.wait('@searchForArticle')
      .get('#testing-content-list-item-title-anchor-text')
      .contains(articleTitle)
      .parent()
      .click();

    // Delete from within Workflow
    cy.get('.drawer__toolbar-item--danger').click();
  });
});
